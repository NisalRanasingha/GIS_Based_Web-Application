import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import FISFooter from '../components/FISFooter';
import FISHeader from '../components/FISHeader';
import 'leaflet/dist/leaflet.css';
import './HarbourBoundaryPage.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const defaultCenter = [7.6, 80.7];
const harbourIcon = L.divIcon({
  className: 'harbour-marker-icon',
  html: '<span class="harbour-marker-pin"><span class="harbour-marker-hole"></span></span>',
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  tooltipAnchor: [0, -36],
});

const isCoordinate = (value) => Array.isArray(value) && value.length >= 2
  && Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1]));

const coordinatePaths = (value) => {
  if (!Array.isArray(value)) return [];
  if (value.every(isCoordinate)) return [value.map((point) => [Number(point[0]), Number(point[1])])];
  return value.flatMap(coordinatePaths);
};

const getCoordinates = (boundary) => {
  let raw = boundary?.coordinates ?? boundary;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (raw?.type === 'Feature') return getCoordinates({ coordinates: raw.geometry?.coordinates });
  if (raw?.type === 'FeatureCollection') {
    return Array.isArray(raw.features) ? raw.features.flatMap(getCoordinates) : [];
  }
  if (raw?.coordinates) return getCoordinates({ coordinates: raw.coordinates });
  return coordinatePaths(raw).filter((path) => path.length > 1);
};

const toRadians = (degrees) => degrees * Math.PI / 180;
const toDegrees = (radians) => radians * 180 / Math.PI;

const distanceAndBearing = (from, to) => {
  const earthRadiusKm = 6371;
  const lat1 = toRadians(from[0]);
  const lat2 = toRadians(to[0]);
  const deltaLat = toRadians(to[0] - from[0]);
  const deltaLng = toRadians(to[1] - from[1]);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  const distance = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  return { distance, bearing: (toDegrees(Math.atan2(y, x)) + 360) % 360 };
};

const nearestBoundaryPoint = (location, paths) => paths
  .flatMap((path) => path.slice(1).map((point, index) => {
    const start = path[index];
    const end = point;
    const latScale = Math.cos(toRadians(location[0]));
    const x = (location[1] - start[1]) * latScale;
    const y = location[0] - start[0];
    const dx = (end[1] - start[1]) * latScale;
    const dy = end[0] - start[0];
    const ratio = Math.max(0, Math.min(1, (x * dx + y * dy) / ((dx * dx) + (dy * dy) || 1)));
    const candidate = [start[0] + dy * ratio, start[1] + (end[1] - start[1]) * ratio];
    return { point: candidate, ...distanceAndBearing(location, candidate) };
  }))
  .sort((left, right) => left.distance - right.distance)[0];

const MapViewport = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [28, 28] });
  }, [bounds, map]);
  return null;
};

const BoundaryLine = ({ boundary, path }) => {
  const map = useMap();
  const pane = map.getPane('harbourBoundaryPane') || map.createPane('harbourBoundaryPane');
  pane.style.zIndex = '450';

  const color = boundary.color || '#ffd400';
  return (
    <Polygon
      positions={path}
      pane="harbourBoundaryPane"
      pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 5, opacity: 1 }}
    >
      <Tooltip sticky>{boundary.name}</Tooltip>
    </Polygon>
  );
};

export default function HarbourBoundaryPage({ onNavigate, currentUser, onLogout }) {
  const [locations, setLocations] = useState([]);
  const [boundaries, setBoundaries] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${apiUrl}/api/harbour-boundaries`)
      .then((response) => {
        if (!response.ok) throw new Error('The harbour map service is unavailable.');
        return response.json();
      })
      .then((result) => {
        if (!active) return;
        setLocations(result.locations || []);
        setBoundaries(result.boundaries || []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const renderedBoundaries = useMemo(() => boundaries.flatMap((boundary) => (
    getCoordinates(boundary).map((path, index) => ({ ...boundary, path, key: `${boundary.id}-${index}` }))
  )), [boundaries]);
  const bounds = useMemo(() => {
    const boundaryBounds = renderedBoundaries.flatMap(({ path }) => path);
    const locationBounds = locations.map((location) => [Number(location.latitude), Number(location.longitude)]);
    return (boundaryBounds.length > 1 ? boundaryBounds : locationBounds)
      .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
  }, [locations, renderedBoundaries]);

  return (
    <div className="harbour-page">
      <FISHeader page="harbourBoundary" onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />
      <main>
        <section className="harbour-hero">
          <div>
            <p className="fics-page-banner-eyebrow">Fisheries Information Center · Navigation support</p>
            <h1>Harbour boundary navigator</h1>
            <p>Hover over a blue harbour marker to see its minimum distance and bearing to the nearest managed boundary.</p>
          </div>
          <div className="harbour-legend"><span className="legend-marker" /> Harbour <span className="legend-line" /> Boundary</div>
        </section>
        <section className="harbour-content">
          {error && <div className="harbour-alert">{error}</div>}
          {isLoading ? <div className="harbour-loading">Loading harbour and boundary data…</div> : (
            <div className="harbour-map-shell">
              <MapContainer center={defaultCenter} zoom={7} scrollWheelZoom className="harbour-map">
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapViewport bounds={bounds} />
                {renderedBoundaries.map(({ key, path, ...boundary }) => (
                  <BoundaryLine key={key} boundary={boundary} path={path} />
                ))}
                {locations.map((location) => {
                  const position = [Number(location.latitude), Number(location.longitude)];
                  const nearest = nearestBoundaryPoint(position, renderedBoundaries.map(({ path }) => path));
                  return (
                    <Marker key={location.id} position={position} icon={harbourIcon}>
                      <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                        <div className="harbour-tooltip">
                          <strong>{location.name}</strong>
                          {nearest ? <><span>Minimum distance: <b>{nearest.distance.toFixed(2)} km</b></span><span>Angle: <b>{nearest.bearing.toFixed(1)}°</b></span></> : <span>No boundary geometry available.</span>}
                        </div>
                      </Tooltip>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          )}
        </section>
      </main>
      <FISFooter onNavigate={onNavigate} />
    </div>
  );
}
