import { useEffect, useState } from 'react';
import { GeoJSON, MapContainer, Polygon, CircleMarker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import FISHeader from '../components/FISHeader';
import FISFooter from '../components/FISFooter';
import FishForecastMap from '../components/FishForecastMap';
import ScrollDownPrompt from '../components/ScrollDownPrompt';
import { getNewsImageUrl, handleNewsImageError } from '../utils/newsImage';
import fishingActPdf from '../assets/logo/02-2016_E_1784552773.pdf';
import 'leaflet/dist/leaflet.css';

const vesselManagementUrl = 'https://fisheriesdept.gov.lk/regulations/';
const libraryUrl = 'http://www.nara.ac.lk/?page_id=3373';
const rightToInformationUrl = 'http://www.nara.ac.lk/?page_id=20339';
const naraNewsUrl = 'http://www.nara.ac.lk/?page_id=20299';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const services = [
  { image: '/services/TF_8K.png', title: 'Tuna Forecasting', text: 'Explore daily marine conditions and habitat suitability maps to support safer fishing decisions.', page: 'fishForecast' },
  { image: '/services/Oceanographic.jpg', title: 'Harbour Boundary Mapping', text: 'View mapped harbour boundaries and coastal locations through the interactive GIS map.', page: 'harbourBoundary' },
  { image: '/services/Adam\'s Bridge Marine National Park.jpg', title: 'Marine Protected Areas', text: 'Discover Sri Lanka’s marine parks, sanctuaries, conservation areas, and mapped locations.', page: 'marineProtectedAreas' },
  { image: '/services/Sri Lanka Tuna Fishing Forecast Map.png', title: 'Weekly Forecast Summary', text: 'Review the weekly marine forecast summary for planning fishing activity across Sri Lanka.', page: 'weeklySummary' },
  { image: '/services/news.png', title: 'News & Events', text: 'Stay informed about fisheries advisories, announcements, workshops, and events.', page: 'news' },
  { image: '/nara_cover.jpg', title: 'Contact & Information Support', text: 'Connect with the Fisheries Information Center for research support and information requests.', page: 'contact' },
];
const marineLocations = [
  { id: 'colombo', name: 'Colombo', latitude: 6.5, longitude: 79.6 },
  { id: 'negombo', name: 'Negombo', latitude: 7.2, longitude: 79.6 },
  { id: 'mannar', name: 'Mannar', latitude: 9, longitude: 79.5 },
  { id: 'jaffna', name: 'Jaffna', latitude: 9.5, longitude: 80.4 },
  { id: 'trincomalee', name: 'Trincomalee', latitude: 8.4, longitude: 82 },
  { id: 'batticaloa', name: 'Batticaloa', latitude: 7.3, longitude: 82 },
  { id: 'galle', name: 'Galle', latitude: 5.8, longitude: 80.1 },
  { id: 'hambantota', name: 'Hambantota', latitude: 5.7, longitude: 81.5 },
  { id: 'oluvil', name: 'Oluvil', latitude: 7.25, longitude: 81.95 },
  { id: 'tangalla', name: 'Tangalla', latitude: 5.95, longitude: 80.85 },
  { id: 'kudawella', name: 'Kudawella', latitude: 5.93, longitude: 80.8 },
];
const getMarineApiUrl = ({ latitude, longitude }) => `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&hourly=wave_height,wave_direction,wave_period,swell_wave_height&forecast_days=7&timezone=Asia%2FColombo&cell_selection=sea`;
const formatMarineNumber = (value, unit) => Number.isFinite(value) ? `${value.toFixed(1)}${unit}` : '—';
const formatForecastDate = (value) => new Intl.DateTimeFormat('en', { weekday: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`));
const formatWaveDirection = (degrees) => {
  if (!Number.isFinite(degrees)) return '—';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return `${directions[Math.round(degrees / 45) % directions.length]} (${Math.round(degrees)}°)`;
};
const buildDailyForecast = (hourly = {}) => {
  const days = new Map();
  (hourly.time || []).forEach((time, index) => {
    const date = time.slice(0, 10);
    const waveHeight = hourly.wave_height?.[index];
    const existing = days.get(date);
    if (!existing || waveHeight > existing.waveHeight) {
      days.set(date, {
        date,
        waveHeight,
        waveDirection: hourly.wave_direction?.[index],
        wavePeriod: hourly.wave_period?.[index],
      });
    }
  });
  return [...days.values()].slice(0, 7);
};

const stats = [
  { value: '2.3M', label: 'Metric Tons Annual Catch' },
  { value: '180K+', label: 'Registered Fishers' },
  { value: '1,340', label: 'Vessels Monitored' },
  { value: '48', label: 'Research Publications (2024)' },
];

const heroSlide = {
  eyebrow: 'Fisheries Information Center · NARA',
  title: 'Ocean Data & Research at Your Fingertips',
  description: 'Access real-time oceanographic data, fish stock assessments, and coastal resource mapping.',
};

const HomeBoundaryViewport = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [24, 24] });
  }, [bounds, map]);
  return null;
};

const getGeoJsonBounds = (geoJson) => {
  const coordinates = [];
  const collectCoordinates = (value) => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && value.every((item) => typeof item === 'number')) {
      const [longitude, latitude] = value;
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) coordinates.push([latitude, longitude]);
      return;
    }
    value.forEach(collectCoordinates);
  };
  collectCoordinates(geoJson?.features?.map((feature) => feature.geometry?.coordinates) || geoJson?.geometry?.coordinates);
  return coordinates;
};

function HarbourMapPreview() {
  const [locations, setLocations] = useState([]);
  const [boundaries, setBoundaries] = useState([]);
  const [marineZone, setMarineZone] = useState(null);
  const [marineBoundaryData, setMarineBoundaryData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchJson = (url, message) => fetch(url).then((response) => {
      if (!response.ok) throw new Error(message);
      return response.json();
    });

    Promise.allSettled([
      fetchJson(`${apiUrl}/api/harbour-boundaries`, 'Harbour boundary service unavailable.'),
      fetchJson(`${apiUrl}/api/marine-boundaries`, 'Marine boundary service unavailable.'),
    ]).then(([harbourResult, marineResult]) => {
      if (!active) return;
      const failures = [];
      if (harbourResult.status === 'fulfilled') {
        setLocations(harbourResult.value.locations || []);
        setBoundaries(harbourResult.value.boundaries || []);
      } else {
        failures.push(harbourResult.reason.message);
      }
      if (marineResult.status === 'fulfilled') {
        setMarineZone(marineResult.value.zone || null);
        setMarineBoundaryData(marineResult.value.boundaries || null);
      } else {
        failures.push(marineResult.reason.message);
      }
      setError(failures.join(' '));
    }).finally(() => {
      if (active) setIsLoading(false);
    });

    return () => { active = false; };
  }, []);

  const boundaryPaths = boundaries.flatMap((boundary) => {
    let coordinates = boundary.coordinates;
    if (typeof coordinates === 'string') {
      try {
        coordinates = JSON.parse(coordinates);
      } catch {
        return [];
      }
    }
    return Array.isArray(coordinates) && coordinates.every((point) => Array.isArray(point) && point.length >= 2)
      ? [{
        coordinates: coordinates
          .map(([lat, lng]) => [Number(lat), Number(lng)])
          .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng)),
        color: boundary.color || '#3388ff',
      }]
      : [];
  }).filter(({ coordinates }) => coordinates.length > 1);
  const locationPoints = locations
    .map((location) => [Number(location.latitude), Number(location.longitude)])
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
  const bounds = [
    ...getGeoJsonBounds(marineBoundaryData),
    ...getGeoJsonBounds(marineZone),
    ...boundaryPaths.flatMap(({ coordinates }) => coordinates),
    ...locationPoints,
  ];

  return (
    <div className="relative z-0 isolate h-[336px] overflow-hidden border-b-4 border-[#0b568d] bg-[#dcecf2]" aria-label="Current harbour boundary navigator map">
      <MapContainer center={[6.93, 79.84]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <HomeBoundaryViewport bounds={bounds} />
        {marineZone && (
          <GeoJSON data={marineZone} style={{ color: '#007da0', fillColor: '#00B3DC', fillOpacity: 0.18, weight: 2 }} />
        )}
        {marineBoundaryData && (
          <GeoJSON data={marineBoundaryData} style={{ color: '#173c4b', weight: 3, opacity: 1 }} />
        )}
        {boundaryPaths.map(({ coordinates, color }, index) => (
          <Polygon key={`${color}-${index}`} positions={coordinates} pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 4 }} />
        ))}
        {locations.map((location) => {
          const position = [Number(location.latitude), Number(location.longitude)];
          if (!Number.isFinite(position[0]) || !Number.isFinite(position[1])) return null;
          return (
            <CircleMarker key={location.id} center={position} radius={5} pathOptions={{ color: '#fff', weight: 2, fillColor: '#087bc4', fillOpacity: 1 }}>
              <Tooltip direction="top">{location.name}</Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      {isLoading && <div className="pointer-events-none absolute inset-0 z-[400] grid place-items-center bg-white/65 text-xs font-semibold text-[#124a78]">Loading current map…</div>}
      {!isLoading && error && <div className="absolute bottom-2 left-2 right-2 z-[400] bg-white/90 px-2 py-1 text-[10px] text-[#7b4e00]">{error}</div>}
    </div>
  );
}

export default function FISHomePage({ onNavigate, currentUser, onLogout }) {
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedMarineLocation, setSelectedMarineLocation] = useState(marineLocations[0].id);
  const [marineData, setMarineData] = useState(null);
  const [marineError, setMarineError] = useState('');
  const [forecastMaps, setForecastMaps] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fish-forecasts?species=yellowfin`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Forecast service unavailable.')))
      .then((result) => setForecastMaps(result.forecasts || []))
      .catch(() => setForecastMaps([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadMarineData = async () => {
      try {
        const location = marineLocations.find(({ id }) => id === selectedMarineLocation) || marineLocations[0];
        const response = await fetch(getMarineApiUrl(location));
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.error) throw new Error(result.reason || 'Unable to load marine conditions.');
        const times = result.hourly?.time || [];
        const currentIndex = times.reduce((closestIndex, time, index) => (
          Math.abs(new Date(time).getTime() - Date.now()) < Math.abs(new Date(times[closestIndex]).getTime() - Date.now())
            ? index
            : closestIndex
        ), 0);
        if (!cancelled) {
          setMarineData({
            time: times[currentIndex],
            waveHeight: result.hourly?.wave_height?.[currentIndex],
            waveDirection: result.hourly?.wave_direction?.[currentIndex],
            wavePeriod: result.hourly?.wave_period?.[currentIndex],
            swellHeight: result.hourly?.swell_wave_height?.[currentIndex],
            forecast: buildDailyForecast(result.hourly),
          });
          setMarineError('');
        }
      } catch (loadError) {
        if (!cancelled) setMarineError(loadError.message);
      }
    };
    const initialRefresh = window.setTimeout(loadMarineData, 0);
    const refreshInterval = window.setInterval(loadMarineData, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearTimeout(initialRefresh);
      window.clearInterval(refreshInterval);
    };
  }, [selectedMarineLocation]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news?limit=5`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load news.')))
      .then((result) => setNewsItems(
        (result.news || []).sort((first, second) => new Date(second.published_at) - new Date(first.published_at)),
      ))
      .catch(() => setNewsItems([]))
      .finally(() => setNewsLoading(false));
  }, []);

  const currentMarineLocation = marineLocations.find(({ id }) => id === selectedMarineLocation) || marineLocations[0];
  const currentSlide = heroSlide;

  return (
    <div className="nara-responsive min-h-screen bg-[#edf3f7] text-[#123d7b]">
      <FISHeader page="home" onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />

      <main>
        <section className="relative h-auto min-h-[calc(100dvh-68px)] w-full overflow-visible bg-[#0a3d72] max-[375px]:min-h-[calc(100dvh-64px)] sm:h-[calc(100dvh-148px)] sm:overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/services/fb1.jpg')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#061d3d]/90 via-[#061d3d]/55 to-[#061d3d]/88 sm:bg-gradient-to-r sm:from-[#061d3d]/90 sm:via-[#061d3d]/72 sm:to-[#061d3d]/40" />
          <ScrollDownPrompt />

          <div className="relative mx-auto flex min-h-[calc(100dvh-68px)] max-w-[1440px] items-start px-4 py-8 max-[375px]:min-h-[calc(100dvh-64px)] max-[375px]:px-3 max-[375px]:pt-10 max-[375px]:pb-5 sm:h-full sm:min-h-0 sm:items-center sm:px-6 sm:py-0 lg:px-8">
            <div className="grid w-full items-start gap-7 sm:items-center sm:gap-6 lg:grid-cols-[1.5fr_0.8fr]">
              <div className="max-w-[700px] text-white">
                <div className="mb-3 inline-flex rounded-full border border-[#f4b740]/35 bg-[#061d3d]/30 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#f4b740] sm:mb-5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[11px] sm:tracking-[0.16em]">{currentSlide.eyebrow}</div>
                <h1 className="max-w-[620px] text-[2.2rem] font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-3xl sm:leading-[1.08] sm:tracking-[-0.03em] lg:text-[3.2rem]">
                  {currentSlide.title}
                </h1>
                <p className="mt-4 max-w-[560px] text-sm leading-6 font-normal text-white/85 sm:mt-4 sm:text-base sm:leading-7 lg:text-lg">
                  {currentSlide.description}
                </p>
                <div className="mt-5 grid max-w-[410px] grid-cols-2 gap-2.5 sm:mt-6 sm:flex sm:max-w-none sm:gap-4">
                  <button type="button" onClick={() => onNavigate('fishForecast')} className="rounded-md bg-[#f4b740] px-3 py-3 text-sm font-semibold text-[#0a3d72] shadow-lg shadow-[#f4b740]/20 transition hover:bg-[#e7a330] sm:rounded-sm sm:px-5 sm:py-2.5">Tuna Forecasting</button>
                  <button onClick={() => onNavigate('contact')} className="rounded-md border border-white/40 bg-white/10 px-3 py-3 text-sm font-normal text-white transition hover:bg-white/15 sm:rounded-sm sm:px-5 sm:py-2.5">Contact Us</button>
                </div>

              </div>

              <div className="w-full min-w-0 rounded-2xl border border-white/20 bg-[#163b61]/55 p-2 shadow-2xl shadow-[#061d3d]/30 backdrop-blur-md sm:rounded-[18px] sm:bg-white/8 sm:p-3">
                <div className="rounded-xl bg-white/10 p-4 pb-5 text-white sm:rounded-[14px] sm:p-3">
                  <div className="mb-2 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.12em] text-[#f4b740] sm:mb-2 sm:text-[10px] sm:tracking-[0.14em]">
                    <span>Live status</span>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] sm:py-1 sm:text-[9px] ${marineError ? 'bg-red-400/20 text-red-200' : 'bg-emerald-400/20 text-emerald-200'}`}>{marineError ? 'Unavailable' : 'Online'}</span>
                  </div>
                  <label className="mb-3 block text-[9px] font-bold uppercase tracking-[0.1em] text-white sm:mb-3 sm:text-[10px]">
                   <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.1em] text-white sm:mb-3 sm:text-[10px]"> Monitoring location</span>
                    <select
                      value={selectedMarineLocation}
                      onChange={(event) => setSelectedMarineLocation(event.target.value)}
                      className="mt-1.5 block w-full rounded border border-white/20 bg-[#123456]/80 px-2 py-1.5 text-xs normal-case tracking-normal text-white outline-none transition focus:border-[#f4b740]"
                      aria-label="Select marine monitoring location"
                    >
                      {marineLocations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                    </select>
                  </label>
                  <div className="space-y-2.5 sm:space-y-2.5">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.1em] text-white/60 sm:text-[12px] sm:tracking-[0.12em]">Wave condition</div>
                      <div className="mt-1 text-2xl font-bold text-white sm:mt-1.5 sm:text-3xl">{formatMarineNumber(marineData?.waveHeight, ' m')}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/80 max-[360px]:grid-cols-1 sm:gap-3 sm:text-sm">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.1em] text-white/60 sm:text-[10px] sm:tracking-[0.12em]">Sea temp</div>
                        <div className="mt-1 font-semibold text-white">{formatWaveDirection(marineData?.waveDirection)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.1em] text-white/60 sm:text-[10px] sm:tracking-[0.12em]">Wind</div>
                        <div className="mt-1 font-semibold text-white">{formatMarineNumber(marineData?.wavePeriod, ' s')}</div>
                      </div>
                    </div>
                    <div className="rounded-md border border-white/10 bg-[#081f3f]/50 p-2 sm:p-2.5">
                      <div className="text-[9px] uppercase tracking-[0.1em] text-white/60 sm:text-[10px] sm:tracking-[0.12em]">Latest bulletin</div>
                      <div className="mt-1 text-xs leading-4 text-white/85 sm:mt-2 sm:text-sm sm:leading-normal">{marineError || (marineData ? `${currentMarineLocation.name} coastal waters are reporting ${formatMarineNumber(marineData.waveHeight, ' m')} waves from the ${formatWaveDirection(marineData.waveDirection).split(' (')[0]} with a ${formatMarineNumber(marineData.wavePeriod, ' second')} period.` : 'Marine conditions are being retrieved automatically.')}</div>
                    </div>
                    <div className="rounded-md border border-white/10 bg-[#081f3f]/50 p-2 sm:p-2.5">
                      <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-white sm:text-[10px]">7-day forecast</div>
                      <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1">
                        {(marineData?.forecast || []).map((day) => (
                          <div key={day.date} className="min-w-[58px] flex-1 rounded border border-white/10 bg-white/10 px-1.5 py-2 text-center max-[420px]:flex-none">
                            <div className="text-[9px] font-semibold text-white/75">{formatForecastDate(day.date)}</div>
                            <div className="mt-1 text-xs font-bold text-white">{formatMarineNumber(day.waveHeight, ' m')}</div>
                            <div className="mt-0.5 text-[9px] text-white/70">{formatWaveDirection(day.waveDirection).split(' (')[0]}</div>
                            <div className="mt-0.5 text-[9px] text-white/60">{formatMarineNumber(day.wavePeriod, ' s')}</div>
                          </div>
                        ))}
                        {!marineData?.forecast?.length && <div className="text-xs text-white/70">Forecast data is being retrieved automatically.</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t-4 border-[#0b568d] bg-[#eaf2f7] py-10 sm:py-14">
          <div className="mx-auto grid max-w-[1440px] gap-7 px-4 sm:px-6 lg:grid-cols-[3fr_2fr] lg:items-stretch lg:px-8">
            <div>
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#b9cbd8] pb-3">
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0b568d]">Fisheries Information Center</div>
                  <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#124a78] sm:text-3xl">Our Services</h2>
                </div>
                <span className="hidden text-xs font-semibold text-slate-500 sm:block">Explore NARA information services</span>
              </div>

              <div className="mb-5 flex flex-wrap border border-[#b9cbd8] bg-white">
                <span className="bg-[#0b568d] px-3 py-2 text-[11px] font-bold text-white sm:px-4">
                  Website Services
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {services.map((service) => (
                  <button
                    type="button"
                    key={service.title}
                    onClick={() => onNavigate(service.page)}
                    className="group flex h-full flex-col overflow-hidden border border-[#c4d3dd] bg-white text-left shadow-[0_2px_6px_rgba(21,67,98,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-[#0b568d] hover:shadow-md"
                  >
                    <div className="h-32 w-full overflow-hidden border-b-2 border-[#f0b429] bg-slate-200 sm:h-36">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover grayscale-[15%] transition duration-300 group-hover:grayscale-0"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-4 text-center">
                      <h3 className="mb-2 text-base font-bold text-[#124a78]">{service.title}</h3>
                      <p className="text-[13px] leading-5 text-slate-600">{service.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <aside className="flex flex-col overflow-hidden border border-[#b9cbd8] bg-white shadow-[0_2px_8px_rgba(21,67,98,0.1)]">
              <div className="bg-[#124a78] px-5 py-4 text-white sm:px-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f0c04a]">Location &amp; access</div>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-white">Find NARA on the map</h2>
              </div>
              <div className="border-b border-[#d4e0e7] px-5 py-4 sm:px-6">
                <p className="text-sm font-semibold text-[#245678]">NARA Fisheries Information Center</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">
                  Crow Island, Mattakkuliya, Colombo 15, Sri Lanka
                </p>
              </div>
              <div className="grid gap-3 bg-[#f5f8fa] p-3">
                <div className="overflow-hidden border border-[#c4d3dd] bg-white">
                  <div className="flex items-center justify-between px-3 py-2">
                    <strong className="text-xs uppercase tracking-[0.08em] text-[#124a78]">Fish forecast</strong>
                    <button type="button" onClick={() => onNavigate('fishForecast')} className="text-[11px] font-bold text-[#0b568d]">Open map →</button>
                  </div>
                  <FishForecastMap forecasts={forecastMaps} compact />
                </div>
                <div className="overflow-hidden border border-[#c4d3dd] bg-white">
                  <div className="flex items-center justify-between px-3 py-2">
                    <strong className="text-xs uppercase tracking-[0.08em] text-[#124a78]">Harbour boundaries</strong>
                    <button type="button" onClick={() => onNavigate('harbourBoundary')} className="text-[11px] font-bold text-[#0b568d]">Open map →</button>
                  </div>
                  <HarbourMapPreview />
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-y border-[#174d72] bg-[#124a78] py-6 text-white sm:py-8">
          <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-1 px-2 sm:gap-6 sm:px-6 lg:px-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className={`min-w-0 px-1 sm:px-0 ${index !== stats.length - 1 ? 'border-r border-white/15 sm:pr-6' : ''}`}>
                <div className="text-2xl font-bold leading-none text-[#f4b740] sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-[9px] leading-tight text-white/80 sm:mt-2 sm:text-[15px]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t-4 border-[#0b568d] bg-[#eaf2f7] py-10 sm:py-14">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:px-6 lg:grid-cols-[1.7fr_0.9fr] lg:px-8">
            <div>
              <div className="mb-5 flex items-end justify-between gap-3 border-b border-[#b9cbd8] pb-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0b568d]">Announcements</div>
                  <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#124a78] sm:text-3xl">Latest News &amp; Events</h2>
                </div>
                <button onClick={() => onNavigate('news')} className="border border-[#b9cbd8] bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#0b568d] transition hover:bg-[#0b568d] hover:text-white">View All ↗</button>
              </div>

              {newsLoading && <div className="border border-[#c4d3dd] bg-white p-8 text-center text-slate-500">Loading the latest updates...</div>}
              {!newsLoading && newsItems.length === 0 && <div className="border border-[#c4d3dd] bg-white p-8 text-center text-slate-500">No news updates have been published yet.</div>}
              <div className="space-y-3">
                {newsItems.map((item, index) => {
                  const publishedDate = new Date(item.published_at);
                  return (
                  <article
                    key={item.id}
                    className="flex gap-4 border border-[#c4d3dd] border-l-4 border-l-[#f0b429] bg-white p-3 shadow-[0_2px_6px_rgba(21,67,98,0.08)] transition hover:border-l-[#0b568d] hover:shadow-md sm:p-4"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden bg-[#0d3b7c] sm:h-24 sm:w-28">
                      <img
                        src={getNewsImageUrl(item.image_url, index)}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(event) => handleNewsImageError(event, item.image_url, index)}
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-center">
                      <span className="inline-flex w-fit bg-[#e7f1f6] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0b568d]">{item.category}</span>

                      <h3 className="mt-2 text-base font-bold leading-6 text-[#124a78] sm:text-[17px]">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-slate-600">{item.content}</p>
                      <time className="mt-2 text-[11px] font-semibold text-[#0b568d]">{publishedDate.toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
                    </div>
                  </article>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="border border-[#b9cbd8] bg-white p-5">
                <h3 className="mb-4 border-b border-[#d4e0e7] pb-3 text-xl font-bold text-[#124a78]">Quick Links</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Library and Information Center', href: libraryUrl, external: true },
                    { label: 'Vessel Registration and Management', href: vesselManagementUrl, external: true },
                    { label: 'Right to Information', href: rightToInformationUrl, external: true },
                    { label: 'NARA News', href: naraNewsUrl, external: true },
                    { label: 'Fisheries Act 2016', href: fishingActPdf, external: true },
                    { label: 'Marine Protected Areas', onClick: () => onNavigate('marineProtectedAreas') },
                  ].map((link) => (
                    <a key={link.label} href={link.href || '#'} onClick={link.onClick ? (event) => { event.preventDefault(); link.onClick(); } : undefined} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined} className="flex items-center justify-between gap-3 border-b border-[#d4e0e7] px-2 py-2 text-[13px] font-semibold text-[#245678] transition hover:bg-[#edf5ff] hover:text-[#0b568d]">
                      <span>{link.label}</span>
                      <span className="text-[#0d3b7c]">›</span>
                    </a>
                  ))}
                </div>
              </div>

            </aside>
          </div>
        </section>
      </main>

      <FISFooter onNavigate={onNavigate} />
    </div>
  );
}
