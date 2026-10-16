import { useEffect, useState } from 'react';
import FISHeader from '../components/FISHeader';
import FISFooter from '../components/FISFooter';
import { DEFAULT_NEWS_IMAGE, getNewsImageUrl } from '../utils/newsImage';
import fishingActPdf from '../assets/logo/02-2016_E_1784552773.pdf';

const vesselManagementUrl = 'https://fisheriesdept.gov.lk/regulations/';
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

const services = [
  {
    image: '/services/Fish.jpg',
    title: 'Fish Stock Assessment',
    text: 'Periodic assessment of demersal and pelagic fish stocks in Sri Lankan waters for sustainable management.',
  },
  {
    image: '/services/Oceanographic.jpg',
    title: 'Oceanographic Data',
    text: 'Real-time sea surface temperature, salinity, and current data from coastal buoy networks.',
  },
  {
    image: '/services/Marine.jpg',
    title: 'Marine Weather Advisories',
    text: 'Specialized forecasts and storm warnings issued directly to fishing communities and vessels.',
  },
  {
    image: '/services/market.jpg',
    title: 'Market Information',
    text: 'Daily fish landing statistics and market prices from all major harbours island-wide.',
  },
  {
    image: '/services/aquaculture.jpg',
    title: 'Aquaculture Support',
    text: 'Technical guidance, licensing, and certification for inland and coastal aquaculture operations.',
  },
  {
    image: '/services/books.jpg',
    title: 'Publications & Reports',
    text: 'Research journals, annual fisheries statistics, and technical reports available for download.',
  },
];

const stats = [
  { value: '2.3M', label: 'Metric Tons Annual Catch' },
  { value: '180K+', label: 'Registered Fishers' },
  { value: '1,340', label: 'Vessels Monitored' },
  { value: '48', label: 'Research Publications (2024)' },
];

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1507296993015-167a20c29988?auto=format&fit=crop&w=1800&q=80',
    eyebrow: 'Fisheries Information Center · NARA',
    title: 'Ocean Data & Research at Your Fingertips',
    description: 'Access real-time oceanographic data, fish stock assessments, and coastal resource mapping.',
  },
  {
    image: '/services/slide1.png',
    eyebrow: 'Marine Monitoring',
    title: 'Live Coastal Intelligence for Safer Fishing',
    description: 'Track ocean conditions, fishing advisories, and seasonal patterns to support sustainable decisions.',
  },
  {
    image: '/services/slide2.png',
    eyebrow: 'Sustainable Growth',
    title: 'Research, Policy & Community Support',
    description: 'Promote responsible fishing, aquaculture expansion, and resilient coastal livelihoods across the island.',
  },
];

export default function FISHomePage({ onNavigate }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedMarineLocation, setSelectedMarineLocation] = useState(marineLocations[0].id);
  const [marineData, setMarineData] = useState(null);
  const [marineError, setMarineError] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(intervalId);
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
  const currentSlide = heroSlides[activeSlide];

  return (
    <div className="nara-responsive min-h-screen bg-[#edf3f7] text-[#123d7b]">
      <FISHeader page="home" onNavigate={onNavigate} />

      <main>
        <section className="relative h-auto min-h-[calc(100dvh-68px)] w-full overflow-visible bg-[#0a3d72] max-[375px]:min-h-[calc(100dvh-64px)] sm:h-[calc(100dvh-148px)] sm:overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.title}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
                index === activeSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-[#061d3d]/90 via-[#061d3d]/55 to-[#061d3d]/88 sm:bg-gradient-to-r sm:from-[#061d3d]/90 sm:via-[#061d3d]/72 sm:to-[#061d3d]/40" />

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
                  <button className="rounded-md bg-[#f4b740] px-3 py-3 text-sm font-semibold text-[#0a3d72] shadow-lg shadow-[#f4b740]/20 transition hover:bg-[#e7a330] sm:rounded-sm sm:px-5 sm:py-2.5">View Data Portal</button>
                  <button onClick={() => onNavigate('contact')} className="rounded-md border border-white/40 bg-white/10 px-3 py-3 text-sm font-normal text-white transition hover:bg-white/15 sm:rounded-sm sm:px-5 sm:py-2.5">Contact Us</button>
                </div>

                <div className="mt-5 flex items-center gap-2 sm:mt-7">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      aria-label={`Go to slide ${index + 1}`}
                      onClick={() => setActiveSlide(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === activeSlide ? 'w-10 bg-[#f4b740]' : 'w-2.5 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
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
                {['Ecosystem Services', 'Marine Data', 'Advisories', 'Research Support'].map((label, index) => (
                  <span
                    key={label}
                    className={`border-r border-[#b9cbd8] px-3 py-2 text-[11px] font-bold sm:px-4 ${
                      index === 0 ? 'bg-[#0b568d] text-white' : 'text-[#245678]'
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {services.map((service) => (
                  <article
                    key={service.title}
                    className="group flex h-full flex-col overflow-hidden border border-[#c4d3dd] bg-white shadow-[0_2px_6px_rgba(21,67,98,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-[#0b568d] hover:shadow-md"
                  >
                    <div className="h-32 w-full overflow-hidden border-b-2 border-[#f0b429] bg-slate-200 sm:h-36">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover grayscale-[15%] transition duration-300 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="mb-2 text-base font-bold text-[#124a78]">{service.title}</h3>
                      <p className="text-[13px] leading-5 text-slate-600">{service.text}</p>
                    </div>
                  </article>
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
              <div className="h-[280px] border-b-4 border-[#0b568d] bg-slate-200 lg:h-[210px] lg:min-h-0">
                <iframe
                  title="Map showing the NARA Fisheries Information Center"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=79.853%2C6.956%2C79.890%2C6.985&amp;layer=mapnik&amp;marker=6.970%2C79.872"
                  className="h-full min-h-[280px] w-full border-0 lg:min-h-0"
                  loading="lazy"
                />
              </div>
              <a
                href="https://www.openstreetmap.org/?mlat=6.970&amp;mlon=79.872#map=15/6.970/79.872"
                target="_blank"
                rel="noreferrer"
                className="bg-[#f5f8fa] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.08em] text-[#0b568d] transition hover:bg-[#e8f1f6]"
              >
                View larger map →
              </a>
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
                {newsItems.map((item) => {
                  const publishedDate = new Date(item.published_at);
                  return (
                  <article
                    key={item.id}
                    className="flex gap-4 border border-[#c4d3dd] border-l-4 border-l-[#f0b429] bg-white p-3 shadow-[0_2px_6px_rgba(21,67,98,0.08)] transition hover:border-l-[#0b568d] hover:shadow-md sm:p-4"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden bg-[#0d3b7c] sm:h-24 sm:w-28">
                      <img
                        src={getNewsImageUrl(item.image_url)}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = DEFAULT_NEWS_IMAGE;
                        }}
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
                    { label: 'Fish Landing Statistics', href: '#' },
                    { label: 'Vessel Registration and Management', href: vesselManagementUrl, external: true },
                    { label: 'Licensing & Permits', href: '#' },
                    { label: 'Research Grants', href: '#' },
                    { label: 'Fisheries Act 2016', href: fishingActPdf, external: true },
                    { label: 'Marine Protected Areas', href: '#' },
                  ].map((link) => (
                    <a key={link.label} href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined} className="flex items-center justify-between gap-3 border-b border-[#d4e0e7] px-2 py-2 text-[13px] font-semibold text-[#245678] transition hover:bg-[#edf5ff] hover:text-[#0b568d]">
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
