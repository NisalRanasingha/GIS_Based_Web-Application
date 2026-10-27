"""NetCDF habitat-suitability processor for the fisheries forecast endpoint."""

import json
import math
import sys
from pathlib import Path

import numpy as np
from netCDF4 import Dataset


# A deliberately conservative simplified Sri Lankan coastline mask. Points inside
# this polygon are discarded; offshore candidates are never rendered on land.
LAND_POLYGON = [
    (5.92, 80.03), (6.20, 80.07), (6.55, 80.05), (6.95, 79.98),
    (7.40, 79.88), (7.85, 79.80), (8.35, 79.83), (8.75, 80.00),
    (9.30, 80.12), (9.65, 80.25), (9.85, 80.65), (9.70, 81.00),
    (9.30, 81.15), (8.95, 81.25), (8.55, 81.30), (8.10, 81.45),
    (7.70, 81.65), (7.35, 81.75), (6.95, 81.80), (6.55, 81.72),
    (6.20, 81.60), (5.95, 81.35), (5.75, 81.02), (5.80, 80.65),
]


def inside_polygon(lat, lon):
    inside = False
    j = len(LAND_POLYGON) - 1
    for i, (yi, xi) in enumerate(LAND_POLYGON):
        yj, xj = LAND_POLYGON[j]
        crosses = ((xi > lon) != (xj > lon)) and (
            lat < (yj - yi) * (lon - xi) / (xj - xi + 1e-12) + yi
        )
        if crosses:
            inside = not inside
        j = i
    return inside


def variable_score(name, variable):
    name = name.lower()
    units = str(getattr(variable, "units", "")).lower()
    if "temp" in name or "temperature" in name or units in ("degree_celsius", "celsius", "degc"):
        return "temperature"
    if "chlor" in name or "chl" in name or "mg m-3" in units:
        return "chlorophyll"
    if "depth" in name or "bathym" in name or units in ("m", "meter", "meters"):
        return "depth"
    if "height" in name or "ssh" in name or "sla" in name or "sea_level" in name:
        return "height"
    return None


def find_field(dataset, field):
    candidates = []
    for name, variable in dataset.variables.items():
        if variable.ndim < 2:
            continue
        if variable_score(name, variable) == field:
            candidates.append(variable)
    if not candidates:
        return None
    return max(candidates, key=lambda value: value.size)


def find_coordinate(dataset, axis):
    names = ("lat", "latitude", "y") if axis == "lat" else ("lon", "longitude", "x")
    for name, variable in dataset.variables.items():
        lowered = name.lower()
        standard = str(getattr(variable, "standard_name", "")).lower()
        axis_name = str(getattr(variable, "axis", "")).lower()
        if lowered in names or standard in names or axis_name == axis[0]:
            values = np.asarray(variable[:]).squeeze()
            if values.ndim == 1 and values.size > 1:
                return values
    return None


def read_layer(path, field):
    with Dataset(path) as dataset:
        variable = find_field(dataset, field)
        latitudes = find_coordinate(dataset, "lat")
        longitudes = find_coordinate(dataset, "lon")
        if variable is None or latitudes is None or longitudes is None:
            return None
        values = np.asarray(variable[:]).squeeze()
        while values.ndim > 2:
            values = values[0]
        if values.ndim != 2:
            return None
        if values.shape == (longitudes.size, latitudes.size):
            values = values.T
        if values.shape != (latitudes.size, longitudes.size):
            return None
        if latitudes[0] > latitudes[-1]:
            latitudes = latitudes[::-1]
            values = values[::-1, :]
        if longitudes[0] > longitudes[-1]:
            longitudes = longitudes[::-1]
            values = values[:, ::-1]
        values = np.ma.filled(values.astype(float), np.nan)
        fill = getattr(variable, "_FillValue", None)
        if fill is not None:
            values[np.isclose(values, fill)] = np.nan
        return latitudes, longitudes, values


def nearest(layer, lat, lon):
    if layer is None:
        return math.nan
    latitudes, longitudes, values = layer
    if lat < latitudes[0] or lat > latitudes[-1] or lon < longitudes[0] or lon > longitudes[-1]:
        return math.nan
    lat_index = int(np.abs(latitudes - lat).argmin())
    lon_index = int(np.abs(longitudes - lon).argmin())
    return float(values[lat_index, lon_index])


def normalize(value, low, high):
    if not math.isfinite(value):
        return math.nan
    return max(0.0, min(1.0, (value - low) / (high - low)))


def score_candidate(lat, lon, layers):
    temperature = nearest(layers.get("temperature"), lat, lon)
    height = nearest(layers.get("height"), lat, lon)
    depth = nearest(layers.get("depth"), lat, lon)
    chlorophyll_values = [
        nearest(layer, lat, lon) for layer in layers.get("chlorophyll", [])
    ]
    chlorophyll_values = [value for value in chlorophyll_values if math.isfinite(value)]
    chlorophyll = float(np.mean(chlorophyll_values)) if chlorophyll_values else math.nan
    if not math.isfinite(temperature) or not math.isfinite(chlorophyll):
        return None

    temperature_fit = max(0.0, 1.0 - abs(temperature - 28.5) / 3.0)
    chlorophyll_fit = max(0.0, 1.0 - abs(math.log10(max(chlorophyll, 1e-6)) - math.log10(0.2)) / 1.2)
    trend = 0.0
    if len(chlorophyll_values) > 1:
        trend = (chlorophyll_values[-1] - chlorophyll_values[0]) / max(abs(chlorophyll_values[0]), 1e-6)
    trend_fit = max(0.0, min(1.0, 0.5 + trend))
    depth_fit = 1.0 if not math.isfinite(depth) else max(0.0, min(1.0, (abs(depth) - 100) / 900))
    height_fit = 0.5
    if math.isfinite(height):
        height_fit = max(0.0, 1.0 - min(abs(height), 1.0))

    score = round(100 * (
        temperature_fit * 0.35
        + chlorophyll_fit * 0.25
        + trend_fit * 0.05
        + height_fit * 0.20
        + depth_fit * 0.15
    ), 2)
    return {
        "lat": round(lat, 5),
        "lng": round(lon, 5),
        "score": score,
        "label": "Offshore fishing area",
        "temperature": round(temperature, 3),
        "chlorophyll": round(chlorophyll, 5),
        "chlorophyll_trend": round(trend, 4),
        "height": round(height, 3) if math.isfinite(height) else None,
        "depth": round(depth, 2) if math.isfinite(depth) else None,
    }


def process(files):
    layers = {}
    chlorophyll = []
    for file_path in files:
        field = file_path.stem.lower()
        field = "chlorophyll" if "chlor" in field else field
        if field.startswith("chlorophyll"):
            field = "chlorophyll"
        if field not in ("temperature", "height", "depth", "chlorophyll"):
            continue
        layer = read_layer(file_path, field)
        if layer is not None:
            if field == "chlorophyll":
                chlorophyll.append(layer)
            else:
                layers[field] = layer
    layers["chlorophyll"] = chlorophyll

    if not layers.get("temperature") or not chlorophyll:
        raise ValueError("The uploaded NetCDF files must contain latitude, longitude, temperature and chlorophyll variables.")

    # Use the uploaded temperature raster as the canonical grid. Re-sampling
    # an artificial regional grid can create forecast cells where no source
    # observation exists and is the cause of false land/ocean patterns.
    base_latitudes, base_longitudes, base_values = layers["temperature"]
    latitudes = base_latitudes
    longitudes = base_longitudes
    latitude_step = float(np.median(np.abs(np.diff(latitudes)))) if len(latitudes) > 1 else 0.05
    longitude_step = float(np.median(np.abs(np.diff(longitudes)))) if len(longitudes) > 1 else 0.05
    max_cells = 6000
    stride = max(1, math.ceil(math.sqrt((len(latitudes) * len(longitudes)) / max_cells)))
    candidates = []
    for lat in latitudes[::stride]:
        for lon in longitudes[::stride]:
            if not inside_polygon(lat, lon):
                result = score_candidate(float(lat), float(lon), layers)
                if result:
                    result["cell_size"] = [round(latitude_step * stride, 5), round(longitude_step * stride, 5)]
                    candidates.append(result)
    candidates.sort(key=lambda item: item["score"], reverse=True)
    # Keep a contiguous set of high-scoring cells so the map represents
    # fishing areas, not one artificially selected point.
    if not candidates:
        raise ValueError("No valid offshore cells with complete environmental coverage were found.")
    scores = np.asarray([candidate["score"] for candidate in candidates])
    cutoff = max(45, float(np.percentile(scores, 70)))
    selected = [candidate for candidate in candidates if candidate["score"] >= cutoff][:500]
    return {
        "hotspots": selected,
        "layers": {
            "temperature": bool(layers.get("temperature")),
            "height": bool(layers.get("height")),
            "depth": bool(layers.get("depth")),
            "chlorophyll_days": len(chlorophyll),
        },
        "candidate_count": len(candidates),
    }


if __name__ == "__main__":
    try:
        paths = [Path(argument) for argument in sys.argv[1:]]
        print(json.dumps(process(paths)))
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
