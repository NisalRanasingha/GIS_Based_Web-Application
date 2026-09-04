import { useEffect, useMemo, useState } from 'react';
import FISHeader from '../components/FISHeader';
import FISFooter from '../components/FISFooter';

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

const newsItems = [
  { day: '12', month: 'AUG', year: '2026', tag: 'Advisory', title: 'High Wave Warning Issued for Western & Southern Coastal Areas' },
  { day: '05', month: 'AUG', year: '2026', tag: 'Research', title: '2026 Annual Tuna Stock Assessment Report Released' },
  { day: '28', month: 'JUL', year: '2026', tag: 'Event', title: 'National Aquaculture Development Forum — Colombo, September 2026' },
  { day: '15', month: 'JUL', year: '2026', tag: 'Policy', title: 'Revised Fisheries Act Regulations Gazetted' },
  { day: '02', month: 'JUL', year: '2026', tag: 'Training', title: 'Capacity Building Workshop on GPS-Aided Fishing Technology' },
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, []);

  const tickerText = useMemo(
    () => 'Seasonal fishing ban extended in Northern Province waters · New aquaculture guidelines published · Fish stock assessment report 2024 now available · High wave warning for western coast',
    [],
  );

  const currentSlide = heroSlides[activeSlide];

  return (
    <div className="nara-responsive min-h-screen bg-[#edf3f7] text-[#123d7b]">
      <FISHeader page="home" onNavigate={onNavigate} />

      <main>
        <section className="relative h-[calc(100vh-72px)] min-h-[620px] overflow-hidden bg-[#0a3d72]">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.title}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
                index === activeSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#061d3d]/90 via-[#061d3d]/72 to-[#061d3d]/40" />

          <div className="relative mx-auto flex h-full max-w-[1440px] items-center px-4 sm:px-6 lg:px-8">
            <div className="grid w-full items-end gap-8 lg:grid-cols-[1.5fr_0.8fr]">
              <div className="max-w-[700px] pb-10 text-white">
                <div className="mb-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#f4b740] sm:text-[11px]">{currentSlide.eyebrow}</div>
                <h1 className="max-w-[620px] text-2xl font-extrabold leading-[1] tracking-[-0.05em] text-white sm:text-3xl lg:text-[3.4rem]">
                  {currentSlide.title}
                </h1>
                <p className="mt-4 max-w-[560px] text-sm text-white/80 sm:text-base lg:text-lg">
                  {currentSlide.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <button className="rounded-sm bg-[#f4b740] px-5 py-2.5 text-sm font-bold text-[#0a3d72] shadow-lg shadow-[#f4b740]/20 transition hover:bg-[#e7a330]">View Data Portal</button>
                  <button onClick={() => onNavigate('contact')} className="rounded-sm border border-white/35 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Contact Us</button>
                </div>

                <div className="mt-7 flex items-center gap-2">
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

              <div className="rounded-[18px] border border-white/15 bg-white/8 p-4 shadow-2xl shadow-[#061d3d]/20 backdrop-blur-sm sm:p-5">
                <div className="rounded-[14px] bg-white/10 p-4 text-white">
                  <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#f4b740]">
                    <span>Live status</span>
                    <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-[9px] text-emerald-200">Online</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-[12px] uppercase tracking-[0.12em] text-white/60">Wave condition</div>
                      <div className="mt-2 text-3xl font-extrabold text-white">2.8m</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-white/60">Sea temp</div>
                        <div className="mt-1 font-bold text-white">29.4°C</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-white/60">Wind</div>
                        <div className="mt-1 font-bold text-white">18 knots</div>
                      </div>
                    </div>
                    <div className="rounded-md border border-white/10 bg-[#081f3f]/50 p-3">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/60">Latest bulletin</div>
                      <div className="mt-2 text-sm text-white/85">Northern coastal region advisory remains in effect until 18:00 hrs.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-[#0c6d7b] text-white">
          <div className="mx-auto flex max-w-[1440px] items-center gap-3 overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
            <div className="shrink-0 rounded-sm bg-[#f4b740] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#061d3d]">Notice</div>
            <div className="overflow-hidden whitespace-nowrap text-[12px] text-white/80">
              <span className="inline-block animate-[scroll_20s_linear_infinite]">{tickerText} · {tickerText}</span>
            </div>
          </div>
        </div>

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
                <button className="rounded-full border border-[#0d3b7c]/20 bg-white px-4 py-2 text-xs font-semibold text-[#0d3b7c] shadow-sm transition hover:bg-[#0d3b7c] hover:text-white">View All ↗</button>
              </div>

              <div className="space-y-4">
                {newsItems.map((item) => (
                  <article
                    key={`${item.day}-${item.month}-${item.title}`}
                    className="flex gap-4 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                  >
                    <div className="flex w-[76px] shrink-0 flex-col items-center justify-center rounded-[14px] bg-[#0d3b7c] px-2 py-4 text-center text-white shadow-sm">
                      <div className="text-2xl font-extrabold leading-none">{item.day}</div>
                      <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-sky-100">{item.month}</div>
                      <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-sky-100">{item.year}</div>
                    </div>

                    <div className="flex flex-1 flex-col justify-center">
                      <span
                        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                          item.tag === 'Advisory' ? 'bg-red-100 text-red-700' :
                          item.tag === 'Research' ? 'bg-blue-100 text-blue-700' :
                          item.tag === 'Event' ? 'bg-emerald-100 text-emerald-700' :
                          item.tag === 'Policy' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.tag}
                      </span>

                      <h3 className="mt-3 text-base font-extrabold leading-6 text-[#123d7b] sm:text-[18px]">{item.title}</h3>

                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#0d3b7c]">
                        <span>Read more</span>
                        <span aria-hidden="true">→</span>
                      </div>
                    </div>
                  </article>
                ))}
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
