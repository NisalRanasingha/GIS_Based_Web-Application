import { useEffect, useState } from 'react';
import FISHeader from '../components/FISHeader';
import FISFooter from '../components/FISFooter';
import { DEFAULT_NEWS_IMAGE, getNewsImageUrl } from '../utils/newsImage';

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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news?limit=5`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load news.')))
      .then((result) => setNewsItems(
        (result.news || []).sort((first, second) => new Date(second.published_at) - new Date(first.published_at)),
      ))
      .catch(() => setNewsItems([]))
      .finally(() => setNewsLoading(false));
  }, []);

  const currentSlide = heroSlides[activeSlide];

  return (
    <div className="nara-responsive min-h-screen bg-[#edf3f7] text-[#123d7b]">
      <FISHeader page="home" onNavigate={onNavigate} />

      <main>
        <section className="relative h-[calc(100dvh-68px)] min-h-0 w-full overflow-hidden bg-[#0a3d72] max-[375px]:h-[calc(100dvh-64px)] sm:h-[calc(100dvh-148px)]">
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

          <div className="relative mx-auto flex h-full max-w-[1440px] items-center px-4 py-8 max-[375px]:px-3 max-[375px]:pt-10 max-[375px]:pb-5 sm:px-6 sm:py-0 lg:px-8">
            <div className="grid w-full items-center gap-7 sm:items-end sm:gap-6 lg:grid-cols-[1.5fr_0.8fr]">
              <div className="max-w-[700px] text-white sm:pb-1 sm:pt-3">
                <div className="mb-3 inline-flex rounded-full border border-[#f4b740]/35 bg-[#061d3d]/30 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#f4b740] sm:mb-5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[11px] sm:tracking-[0.2em]">{currentSlide.eyebrow}</div>
                <h1 className="max-w-[620px] text-[2.35rem] font-extrabold leading-[0.98] tracking-[-0.05em] text-white sm:text-3xl sm:leading-[1] sm:tracking-[-0.05em] lg:text-[3.4rem]">
                  {currentSlide.title}
                </h1>
                <p className="mt-4 max-w-[560px] text-sm leading-6 text-white/85 sm:mt-4 sm:text-base sm:leading-normal lg:text-lg">
                  {currentSlide.description}
                </p>
                <div className="mt-5 grid max-w-[410px] grid-cols-2 gap-2.5 sm:mt-6 sm:flex sm:max-w-none sm:gap-4">
                  <button className="rounded-md bg-[#f4b740] px-3 py-3 text-sm font-bold text-[#0a3d72] shadow-lg shadow-[#f4b740]/20 transition hover:bg-[#e7a330] sm:rounded-sm sm:px-5 sm:py-2.5">View Data Portal</button>
                  <button onClick={() => onNavigate('contact')} className="rounded-md border border-white/40 bg-white/10 px-3 py-3 text-sm font-semibold text-white transition hover:bg-white/15 sm:rounded-sm sm:px-5 sm:py-2.5">Contact Us</button>
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

              <div className="rounded-2xl border border-white/20 bg-[#163b61]/55 p-2 shadow-2xl shadow-[#061d3d]/30 backdrop-blur-md sm:rounded-[18px] sm:bg-white/8 sm:p-4">
                <div className="rounded-xl bg-white/10 p-4 pb-5 text-white sm:rounded-[14px] sm:p-4">
                  <div className="mb-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.14em] text-[#f4b740] sm:mb-3 sm:text-[10px] sm:tracking-[0.18em]">
                    <span>Live status</span>
                    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[8px] text-emerald-200 sm:py-1 sm:text-[9px]">Online</span>
                  </div>
                  <div className="space-y-2.5 sm:space-y-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.1em] text-white/60 sm:text-[12px] sm:tracking-[0.12em]">Wave condition</div>
                      <div className="mt-1 text-2xl font-extrabold text-white sm:mt-2 sm:text-3xl">2.8m</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/80 sm:gap-3 sm:text-sm">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.1em] text-white/60 sm:text-[10px] sm:tracking-[0.12em]">Sea temp</div>
                        <div className="mt-1 font-bold text-white">29.4°C</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.1em] text-white/60 sm:text-[10px] sm:tracking-[0.12em]">Wind</div>
                        <div className="mt-1 font-bold text-white">18 knots</div>
                      </div>
                    </div>
                    <div className="rounded-md border border-white/10 bg-[#081f3f]/50 p-2 sm:p-3">
                      <div className="text-[9px] uppercase tracking-[0.1em] text-white/60 sm:text-[10px] sm:tracking-[0.12em]">Latest bulletin</div>
                      <div className="mt-1 text-xs leading-4 text-white/85 sm:mt-2 sm:text-sm sm:leading-normal">Northern coastal region advisory remains in effect until 18:00 hrs.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#edf3f7] py-16 sm:py-20">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#0a3d72]">Fisheries Information Center</div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#103d7a] sm:text-5xl">Our Services</h2>
              <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600 sm:text-xl">
                Comprehensive information services for the aquatic resources sector
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.title}
                  className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-52 w-full overflow-hidden bg-slate-200">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="mb-3 text-xl font-extrabold text-[#103d7a]">{service.title}</h3>
                    <p className="text-[15px] leading-7 text-slate-600">{service.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0d6973] py-12 text-white">
          <div className="mx-auto grid max-w-[1440px] gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className={`${index !== stats.length - 1 ? 'border-b border-white/15 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6' : ''}`}>
                <div className="text-4xl font-extrabold text-[#f4b740] sm:text-5xl">{stat.value}</div>
                <div className="mt-2 text-[15px] text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#edf3f7] py-16 sm:py-20">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:px-6 lg:grid-cols-[1.7fr_0.9fr] lg:px-8">
            <div>
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#0a3d72]">Announcements</div>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#103d7a] sm:text-3xl">Latest News &amp; Updates</h2>
                </div>
                <button onClick={() => onNavigate('news')} className="rounded-full border border-[#0d3b7c]/20 bg-white px-4 py-2 text-xs font-semibold text-[#0d3b7c] shadow-sm transition hover:bg-[#0d3b7c] hover:text-white">View All ↗</button>
              </div>

              {newsLoading && <div className="rounded-[18px] border border-slate-200 bg-white p-8 text-center text-slate-500">Loading the latest updates...</div>}
              {!newsLoading && newsItems.length === 0 && <div className="rounded-[18px] border border-slate-200 bg-white p-8 text-center text-slate-500">No news updates have been published yet.</div>}
              <div className="space-y-4">
                {newsItems.map((item) => {
                  const publishedDate = new Date(item.published_at);
                  return (
                  <article
                    key={item.id}
                    className="flex gap-4 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-[#0d3b7c] sm:h-28 sm:w-32">
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
                      <span className="inline-flex w-fit rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-cyan-800">{item.category}</span>

                      <h3 className="mt-3 text-base font-extrabold leading-6 text-[#123d7b] sm:text-[18px]">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.content}</p>
                      <time className="mt-3 text-xs font-semibold text-[#0d3b7c]">{publishedDate.toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
                    </div>
                  </article>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[12px] border border-slate-200 bg-white/40 p-5">
                <h3 className="mb-4 text-3xl font-extrabold text-[#103d7a]">Quick Links</h3>
                <div className="space-y-3">
                  {['Fish Landing Statistics', 'Vessel Registration Portal', 'Licensing & Permits', 'Research Grants', 'Fisheries Act 2026', 'Marine Protected Areas'].map((link) => (
                    <a key={link} href="#" className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white/60 px-4 py-3 text-[15px] font-medium text-[#123d7b] transition hover:border-[#0d3b7c]/30 hover:bg-[#edf5ff]">
                      <span>{link}</span>
                      <span className="text-[#0d3b7c]">›</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-[12px] bg-[#0d3b7c] p-6 text-white shadow-lg shadow-[#0d3b7c]/20">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl">🐟</div>
                <h3 className="text-3xl font-extrabold text-white">Contact Us</h3>
                <p className="mt-3 text-[15px] leading-7 text-white/75">Have a question or need technical assistance?</p>
                <button onClick={() => onNavigate('contact')} className="mt-5 w-full rounded-sm bg-[#f4b740] px-5 py-3 text-sm font-bold text-[#0a3d72] transition hover:bg-[#e7a330]">Send an Inquiry →</button>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <FISFooter onNavigate={onNavigate} />
    </div>
  );
}
