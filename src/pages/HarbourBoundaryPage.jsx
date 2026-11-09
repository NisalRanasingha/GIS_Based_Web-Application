import { useEffect, useMemo, useState } from 'react';
import { GeoJSON, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { lineString, point } from '@turf/helpers';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import FISFooter from '../components/FISFooter';
import FISHeader from '../components/FISHeader';
import LoadingOverlay from '../components/LoadingOverlay';
import 'leaflet/dist/leaflet.css';
import './HarbourBoundaryPage.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const defaultCenter = [7.6, 80.7];
const harbourIcon = L.divIcon({
  className: 'harbour-marker-icon',
  html: '<span class="harbour-marker-pin"><span class="harbour-marker-hole"></span></span>',
  iconSize: [15, 20],
  iconAnchor: [7.5, 20],
  tooltipAnchor: [0, -18],
});

const getMarineBoundaryLines = (featureCollection) => (featureCollection.features || []).flatMap((feature) => {
  const geometry = feature.geometry;
  const lines = geometry?.type === 'LineString'
    ? [geometry.coordinates]
    : geometry?.type === 'MultiLineString'
      ? geometry.coordinates
      : [];
  return lines
    .filter((coordinates) => coordinates.length > 1)
    .map((coordinates, index) => ({
      name: feature.properties?.line_name || 'Sri Lanka marine boundary',
      path: coordinates.map(([longitude, latitude]) => [latitude, longitude]),
      line: lineString(coordinates, feature.properties),
      key: `${feature.id || 'boundary'}-${index}`,
    }));
});

const nearestBoundaryPoint = (location, boundaries) => {
  const locationPoint = point([location[1], location[0]]);
  return boundaries
    .map((boundary) => {
      const nearest = nearestPointOnLine(boundary.line, locationPoint, { units: 'kilometers' });
      return { boundary, point: [nearest.geometry.coordinates[1], nearest.geometry.coordinates[0]], distance: nearest.properties.dist };
    })
    .sort((left, right) => left.distance - right.distance)[0];
};

const MapViewport = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [28, 28] });
  }, [bounds, map]);
  return null;
};

export default function HarbourBoundaryPage({ onNavigate, currentUser, onLogout }) {
  const [locations, setLocations] = useState([]);
  const [boundaries, setBoundaries] = useState([]);
  const [marineZone, setMarineZone] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchJson = (url, message) => fetch(url).then((response) => {
      if (!response.ok) throw new Error(message);
      return response.json();
    });
    Promise.allSettled([
      fetchJson(`${apiUrl}/api/harbour-boundaries`, 'The harbour map service is unavailable.'),
      fetchJson(`${apiUrl}/api/marine-boundaries`, 'The Marine Regions boundary service is unavailable.'),
    ])
      .then(([locationsResult, boundariesResult]) => {
        if (!active) return;
        const failures = [];
        if (locationsResult.status === 'fulfilled') {
          setLocations(locationsResult.value.locations || []);
        } else {
          failures.push(locationsResult.reason.message);
        }
        if (boundariesResult.status === 'fulfilled') {
          setBoundaries(getMarineBoundaryLines(boundariesResult.value.boundaries));
          setMarineZone(boundariesResult.value.zone);
        } else {
          failures.push(boundariesResult.reason.message);
        }
        setError(failures.join(' '));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const bounds = useMemo(() => {
    const boundaryBounds = boundaries.flatMap(({ path }) => path);
    const locationBounds = locations.map((location) => [Number(location.latitude), Number(location.longitude)]);
    return (boundaryBounds.length > 1 ? boundaryBounds : locationBounds)
      .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
  }, [locations, boundaries]);

  return (
    <div className="harbour-page">
      {isLoading && <LoadingOverlay message="Loading harbour boundary map..." className="harbour-loading-overlay" />}
      <FISHeader page="harbourBoundary" onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />
      <main>
        <section className="harbour-content">
          <div className="harbour-legend"><span className="legend-marker" /> Fisherman&apos;s harbour <span className="legend-line" /> Sri Lanka marine boundary</div>
          {error && <div className="harbour-alert">{error}</div>}
          {isLoading ? <div className="harbour-loading">Loading harbour and boundary data…</div> : (
            <div className="harbour-map-shell">
              <MapContainer center={defaultCenter} zoom={7} scrollWheelZoom className="harbour-map">
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapViewport bounds={bounds} />
                {marineZone && (
                  <GeoJSON
                    data={marineZone}
                    style={{ color: '#007da0', fillColor: '#00B3DC', fillOpacity: 0.8, weight: 3, opacity: 1 }}
                  />
                )}
                {boundaries.map(({ key, path, name }) => (
                  <Polyline key={key} positions={path} pathOptions={{ color: '#173c4b', weight: 3, opacity: 1 }}>
                    <Tooltip sticky>{name}</Tooltip>
                  </Polyline>
                ))}
                {locations.map((location) => {
                  const position = [Number(location.latitude), Number(location.longitude)];
                  const nearest = nearestBoundaryPoint(position, boundaries);
                  return (
                    <Marker key={location.id} position={position} icon={harbourIcon}>
                      <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                        <div className="harbour-tooltip">
                          <strong>{location.name}</strong>
                          {nearest ? <span>Shortest sea boundary distance: <b>{nearest.distance.toFixed(2)} km</b></span> : <span>No boundary geometry available.</span>}
                        </div>
                      </Tooltip>
                      <Popup>
                        <div className="harbour-tooltip">
                          <strong>{location.name}</strong>
                          {nearest ? (
                            <>
                              <span>Shortest sea boundary distance: <b>{nearest.distance.toFixed(2)} km</b></span>
                              <span>Shortest boundary point:</span>
                              <span>Latitude: <b>{nearest.point[0].toFixed(6)}</b></span>
                              <span>Longitude: <b>{nearest.point[1].toFixed(6)}</b></span>
                            </>
                          ) : <span>No boundary geometry available.</span>}
                        </div>
                      </Popup>
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
