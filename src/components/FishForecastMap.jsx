import { useEffect, useMemo, useState } from 'react';
import { GeoJSON, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import yellowfinImage from '../assets/Yellowfin Tuna in Deep Blue Waters.png';
import bigeyeImage from '../assets/Bigeye Tuna in Deep Blue Waters.png';
import skipjackImage from '../assets/Skipjack Tuna in Deep Blue Waters.png';
import 'leaflet/dist/leaflet.css';
import './FishForecast.css';

const harbours = {
  Colombo: [6.9271, 79.8612], Negombo: [7.2083, 79.8358], Beruwala: [6.4788, 79.9828],
  Galle: [6.0329, 80.2168], Mirissa: [5.9485, 80.4583], Matara: [5.9549, 80.555],
  Dikwella: [5.9658, 80.683], Kudawella: [5.992, 80.742], Tangalle: [6.024, 80.791],
  Hambantota: [6.1241, 81.1185], Kirinda: [6.226, 81.306], Oluvil: [7.283, 81.852],
  Kalmunai: [7.416, 81.825], Batticaloa: [7.71, 81.7], Trincomalee: [8.5874, 81.2152],
  Pulmoddai: [8.93, 81.54], Mullaitivu: [9.267, 80.814], PointPedro: [9.817, 80.236],
  Jaffna: [9.668, 80.007], Mannar: [8.981, 79.904], Kalpitiya: [8.237, 79.766],
  Puttalam: [8.037, 79.83], Chilaw: [7.575, 79.795],
};

const speciesImages = {
  yellowfin: yellowfinImage,
  bigeye: bigeyeImage,
  skipjack: skipjackImage,
};

const parseShapefile = (buffer) => {
  if (buffer.byteLength < 100) {
    throw new Error('The shapefile is incomplete.');
  }

  const view = new DataView(buffer);
  const shapeType = view.getInt32(32, true);
  const features = [];
  let offset = 100;

  while (offset + 8 <= buffer.byteLength) {
    const contentLength = view.getInt32(offset + 4, false) * 2;
    const contentStart = offset + 8;
    if (contentLength < 4 || contentStart + contentLength > buffer.byteLength) {
      throw new Error('The shapefile contains an invalid record.');
    }
    const recordType = view.getInt32(contentStart, true);

    if (recordType === 1 && contentLength >= 20) {
      features.push({
        type: 'point',
        coordinates: [view.getFloat64(contentStart + 12, true), view.getFloat64(contentStart + 4, true)],
      });
    } else if ([5, 15, 25].includes(recordType) && contentLength >= 44) {
      const partCount = view.getInt32(contentStart + 36, true);
      const pointCount = view.getInt32(contentStart + 40, true);
      const partsOffset = contentStart + 44;
      const pointsOffset = partsOffset + partCount * 4;
      if (partCount < 1 || pointCount < 1 || pointsOffset + pointCount * 16 > contentStart + contentLength) {
        throw new Error('The shapefile contains an invalid polygon record.');
      }
      const parts = Array.from({ length: partCount }, (_, index) => view.getInt32(partsOffset + index * 4, true));
      const points = Array.from({ length: pointCount }, (_, index) => [
        view.getFloat64(pointsOffset + index * 16, true),
        view.getFloat64(pointsOffset + index * 16 + 8, true),
      ]);
      features.push({
        type: 'polygon',
        coordinates: parts.map((start, index) => points.slice(start, parts[index + 1] ?? pointCount).map(([lng, lat]) => [lat, lng])),
        geoJsonCoordinates: parts.map((start, index) => points.slice(start, parts[index + 1] ?? pointCount)),
      });
    }
    offset = contentStart + contentLength;
  }

  if (!features.length) {
    throw new Error(`The shapefile geometry type (${shapeType}) is not supported.`);
  }

  return { shapeType, features };
};

const loadShapeFiles = async (species) => {
  const uploaded = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fish-forecast-shapes/${species}`);
  if (!uploaded.ok) {
    throw new Error('No published map is available for this species.');
  }
  const result = await uploaded.json();
  const fishingAreaFiles = (result.shapes || []).filter((shape) => !/_cpoint\.shp$/i.test(shape.original_name));
  const loadedShapes = fishingAreaFiles.flatMap((shape) => {
    const parsed = parseShapefile(Uint8Array.from(atob(shape.content), (character) => character.charCodeAt(0)).buffer);
    return parsed.features.filter((feature) => feature.type === 'polygon').map((feature, index) => ({
      ...feature,
      file: `${shape.id}-${index}`,
      region: shape.original_name.replace(/\.shp$/i, ''),
      forecastDate: shape.forecast_date,
    }));
  });
  if (!loadedShapes.length) {
    throw new Error('No polygon fishing-area shapefile is available for this species.');
  }
  return loadedShapes;
};

const loadLocalShapeFiles = async (files) => (
  (await Promise.all(files.map(async (file) => {
    if (/_cpoint\.shp$/i.test(file.name)) return [];
    const parsed = parseShapefile(await file.arrayBuffer());
    return parsed.features.filter((feature) => feature.type === 'polygon').map((feature, index) => ({
      ...feature,
      file: `${file.name}-${index}`,
      region: file.name.replace(/\.shp$/i, ''),
      forecastDate: null,
    }));
  }))).flat()
);

const MapViewport = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds.length) map.fitBounds(bounds, { padding: [24, 24] });
  }, [bounds, map]);
  return null;
};

const sriLankaMask = [
  [5.92, 80.03], [6.55, 80.05], [7.4, 79.88], [8.35, 79.83],
  [9.3, 80.12], [9.85, 80.65], [9.3, 81.15], [8.55, 81.3],
  [7.7, 81.65], [6.95, 81.8], [6.2, 81.6], [5.75, 81.02],
];

const isLand = (lat, lng) => {
  let inside = false;
  for (let index = 0, previous = sriLankaMask.length - 1; index < sriLankaMask.length; previous = index += 1) {
    const [currentLat, currentLng] = sriLankaMask[index];
    const [previousLat, previousLng] = sriLankaMask[previous];
    if (((currentLng > lng) !== (previousLng > lng))
      && lat < ((previousLat - currentLat) * (lng - currentLng)) / (previousLng - currentLng) + currentLat) {
      inside = !inside;
    }
  }
  return inside;
};

const seaRoute = (from, to) => {
  const step = 0.06;
  const minLat = Math.min(from[0], to[0]) - 1.2;
  const maxLat = Math.max(from[0], to[0]) + 1.2;
  const minLng = Math.min(from[1], to[1]) - 1.2;
  const maxLng = Math.max(from[1], to[1]) + 1.2;
  const key = (row, column) => `${row}:${column}`;
  const toCell = (point) => [Math.round((point[0] - minLat) / step), Math.round((point[1] - minLng) / step)];
  const toPoint = ([row, column]) => [minLat + row * step, minLng + column * step];
  const start = toCell(from);
  const end = toCell(to);
  const queue = [{ cell: start, cost: 0 }];
  const cameFrom = new Map();
  const costs = new Map([[key(start[0], start[1]), 0]]);
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  const crossesLand = (start, end) => {
    const distance = Math.max(Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]));
    const samples = Math.max(2, Math.ceil(distance / 0.015));
    for (let index = 1; index < samples; index += 1) {
      const progress = index / samples;
      const lat = start[0] + (end[0] - start[0]) * progress;
      const lng = start[1] + (end[1] - start[1]) * progress;
      if (isLand(lat, lng)) return true;
    }
    return false;
  };

  while (queue.length) {
    queue.sort((left, right) => left.cost - right.cost);
    const currentItem = queue.shift();
    const current = currentItem.cell;
    if (current[0] === end[0] && current[1] === end[1]) break;
    directions.forEach(([rowDelta, columnDelta]) => {
      const next = [current[0] + rowDelta, current[1] + columnDelta];
      const point = toPoint(next);
      const currentPoint = toPoint(current);
      const leavesHarbour = current[0] === start[0] && current[1] === start[1];
      if (point[0] < minLat || point[0] > maxLat || point[1] < minLng || point[1] > maxLng
        || isLand(point[0], point[1])
        || (!leavesHarbour && crossesLand(currentPoint, point))) return;
      const nextKey = key(next[0], next[1]);
      const nextCost = (costs.get(key(current[0], current[1])) || 0) + Math.hypot(rowDelta, columnDelta);
      if (nextCost < (costs.get(nextKey) ?? Infinity)) {
        costs.set(nextKey, nextCost);
        cameFrom.set(nextKey, current);
        queue.push({ cell: next, cost: nextCost });
      }
    });
  }

  const path = [];
  let current = end;
  while (current) {
    path.unshift(toPoint(current));
    current = cameFrom.get(key(current[0], current[1]));
  }
  return path.length > 1 ? [from, ...path.slice(1, -1), to] : [];
};

const distanceKm = (from, to) => {
  const radians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const latDelta = radians(to.lat - from[0]);
  const lngDelta = radians(to.lng - from[1]);
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(radians(from[0])) * Math.cos(radians(to.lat)) * Math.sin(lngDelta / 2) ** 2;
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const routeDistanceKm = (route) => route.slice(1).reduce((total, point, index) => (
  total + distanceKm(route[index], { lat: point[0], lng: point[1] })
), 0);

export default function FishForecastMap({ forecasts = [], compact = false, species = 'yellowfin', localFiles = [] }) {
  const [harbour, setHarbour] = useState('Colombo');
  const [selectedId, setSelectedId] = useState(0);
  const [shapes, setShapes] = useState([]);
  const [selectedArea, setSelectedArea] = useState(0);
  const [shapeError, setShapeError] = useState('');
  const forecast = forecasts[selectedId] || forecasts[0];
  const hotspots = forecast?.hotspots || [];
  const selectedHotspot = hotspots[0];
  const start = harbours[harbour];
  const selectedShape = shapes[selectedArea];
  const areaTarget = useMemo(() => {
    if (!selectedShape) return null;
    if (selectedShape.type === 'point') return selectedShape.coordinates;
    const points = selectedShape.coordinates.flat();
    if (!points.length) return null;
    return points.reduce((result, point) => [result[0] + point[0], result[1] + point[1]], [0, 0]).map((value) => value / points.length);
  }, [selectedShape]);
  const target = useMemo(() => areaTarget || (selectedHotspot ? [selectedHotspot.lat, selectedHotspot.lng] : null), [areaTarget, selectedHotspot]);
  const route = useMemo(() => target ? seaRoute(start, target) : [], [start, target]);
  const distance = route.length > 1 ? routeDistanceKm(route) : 0;
  const cellCount = shapes.length || hotspots.length;

  const coverage = useMemo(() => Math.round(forecast?.confidence || 82), [forecast]);
  const shapeBounds = useMemo(() => shapes.flatMap((shape) => (
    shape.type === 'point' ? [shape.coordinates] : shape.coordinates.flat()
  )), [shapes]);

  useEffect(() => {
    let active = true;
    const load = localFiles.length ? loadLocalShapeFiles(localFiles) : loadShapeFiles(species);
    load
      .then((loadedShapes) => {
        if (active) {
          setShapes(loadedShapes);
          setSelectedArea(0);
          setShapeError('');
        }
      })
      .catch((error) => {
        if (active) setShapeError(error.message);
      });
    return () => { active = false; };
  }, [forecasts, localFiles, species]);

  return (
    <div className={`forecast-map-shell ${compact ? 'forecast-map-shell-compact' : ''}`}>
      {!compact && (
        <div className="forecast-map-toolbar">
          <div className="forecast-species-card">
            <img src={speciesImages[species]} alt={`${species} tuna`} />
            <div><span>Selected species</span><strong>{species} tuna</strong></div>
          </div>
          <label>
            Harbour
            <select value={harbour} onChange={(event) => setHarbour(event.target.value)}>
              {Object.keys(harbours).map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
          <div className="forecast-map-stat"><span>Model confidence</span><strong>{coverage}%</strong></div>
          <div className="forecast-map-stat"><span>Selected area distance</span><strong>{distance} km by sea · {cellCount} areas</strong></div>
        </div>
      )}
      {!compact && forecasts.length > 1 && (
        <div className="forecast-timeline" aria-label="Past seven forecast days">
          {forecasts.map((item, index) => (
            <button type="button" className={index === selectedId ? 'active' : ''} key={`${item.forecast_date}-${index}`} onClick={() => setSelectedId(index)}>
              <span>{new Date(item.forecast_date).toLocaleDateString('en', { weekday: 'short' })}</span>
              <strong>{new Date(item.forecast_date).toLocaleDateString('en', { day: '2-digit', month: 'short' })}</strong>
            </button>
          ))}
        </div>
      )}
      <div className="forecast-map">
        <MapContainer center={[5, 73]} zoom={4.5} scrollWheelZoom={false}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapViewport bounds={shapeBounds} />
          {shapes.map((shape, index) => {
            const key = `${shape.file}-${index}`;
            const tooltip = <Tooltip>{shape.region} fishing area</Tooltip>;
            return (
              <GeoJSON
                key={key}
                data={{
                  type: 'Feature',
                  properties: { region: shape.region },
                  geometry: { type: 'Polygon', coordinates: shape.geoJsonCoordinates },
                }}
                style={{ color: '#b51f1f', fillColor: '#d62828', fillOpacity: index === selectedArea ? 0.65 : 0.4, weight: index === selectedArea ? 3 : 2 }}
                eventHandlers={{ click: () => setSelectedArea(index) }}
              >
                {tooltip}
              </GeoJSON>
            );
          })}
          <Polyline positions={route} pathOptions={{ color: '#123d7b', dashArray: '8 8', weight: 3 }} />
        </MapContainer>
      </div>
      {!compact && selectedShape && (
        <section className="forecast-area-details" aria-live="polite">
          <div>
            <span>Selected forecast area</span>
            <strong>{selectedShape.region}</strong>
          </div>
          <div>
            <span>Geometry</span>
            <strong>{selectedShape.type === 'point' ? 'Forecast centre point' : 'Forecast polygon'}</strong>
          </div>
          <div>
            <span>Forecast date</span>
            <strong>{selectedShape.forecastDate ? new Date(selectedShape.forecastDate).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Local upload preview'}</strong>
          </div>
          <div>
            <span>Route from</span>
            <strong>{harbour} harbour · {distance} km by sea</strong>
          </div>
        </section>
      )}
      {!compact && <p className="forecast-map-note">{shapeError ? `Forecast shape layers could not be loaded: ${shapeError}` : 'Red polygons show forecast fishing areas. Select a harbour from the list or its blue map marker, then select an area to see the shortest sea route. Always confirm sea conditions before departure.'}</p>}
    </div>
  );
}
