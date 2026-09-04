const services = [
  {
    icon: '🐟',
    title: 'Fish Stock Assessment',
    text: 'Periodic assessment of demersal and pelagic fish stocks in Sri Lankan waters for sustainable management.',
  },
  {
    icon: '≈',
    title: 'Oceanographic Data',
    text: 'Real-time sea surface temperature, salinity, and current data from coastal buoy networks.',
  },
  {
    icon: '⚠',
    title: 'Marine Weather Advisories',
    text: 'Specialized forecasts and storm warnings issued directly to fishing communities and vessels.',
  },
  {
    icon: '▤',
    title: 'Market Information',
    text: 'Daily fish landing statistics and market prices from all major harbours island-wide.',
  },
  {
    icon: '⚓',
    title: 'Aquaculture Support',
    text: 'Technical guidance, licensing, and certification for inland and coastal aquaculture operations.',
  },
  {
    icon: '▣',
    title: 'Publications & Reports',
    text: 'Research journals, annual fisheries statistics, and technical reports available for download.',
  },
]

const stats = [
  { value: '2.3M', label: 'Metric Tons Annual Catch' },
  { value: '180K+', label: 'Registered Fishers' },
  { value: '1,340', label: 'Vessels Monitored' },
  { value: '48', label: 'Research Publications (2024)' },
]

const newsItems = [
  { date: '12', month: 'AUG', year: '2026', tag: 'Advisory', label: 'High Wave Warning Issued for Western & Southern Coastal Areas' },
  { date: '05', month: 'AUG', year: '2026', tag: 'Research', label: '2026 Annual Tuna Stock Assessment Report Released' },
  { date: '28', month: 'JUL', year: '2026', tag: 'Event', label: 'National Aquaculture Development Forum — Colombo, September 2026' },
  { date: '15', month: 'JUL', year: '2026', tag: 'Policy', label: 'Revised Fisheries Act Regulations Gazetted' },
  { date: '02', month: 'JUL', year: '2026', tag: 'Training', label: 'Capacity Building Workshop on GPS-Aided Fishing Technology' },
]

const quickLinks = [
  'Fish Landing Statistics',
  'Vessel Registration Portal',
  'Licensing & Permits',
  'Research Grants',
  'Fisheries Act 2026',
  'Marine Protected Areas',
]

export default function HomePage({ onNavigate }) {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-copy-wrap">
          <div className="hero-copy-block">
            <div className="hero-tag">FISHERIES INFORMATION CENTER • NARA</div>
            <h2>
              Ocean Data &amp; Research at Your
              <br />
              Fingertips
            </h2>
          </div>

          <div className="hero-arrows">
            <button type="button" className="arrow-button">‹</button>
            <button type="button" className="arrow-button">›</button>
          </div>
        </div>
      </section>

      <div className="ticker-bar">
        <div className="container ticker-inner">
          <span className="ticker-label">NOTICE</span>
          <span>New available • High wave warning for western coast</span>
          <span>• Seasonal fishing ban extended in Northern Province waters</span>
          <span>• New aquaculture guidelines published</span>
          <span>• Fish stock assessment report released</span>
        </div>
      </div>

      <main className="page-main">
        <section className="services-section">
          <div className="container">
            <div className="section-title-block">
              <div className="section-kicker">FISHERIES INFORMATION CENTER</div>
              <h3>Our Services</h3>
            </div>

            <div className="services-grid">
              {services.map((service) => (
                <article key={service.title} className="service-card">
                  <div className="service-icon">{service.icon}</div>
                  <h4>{service.title}</h4>
                  <p>{service.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="stats-band">
          <div className="container stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-box">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="news-section">
          <div className="container news-grid-layout">
            <div className="news-main">
              <div className="news-header">
                <h3>Latest News &amp; Announcements</h3>
                <button type="button" className="view-link" onClick={() => onNavigate('contact')}>
                  View All ↗
                </button>
              </div>

              <div className="news-list">
                {newsItems.map((news) => (
                  <article key={news.label} className="news-item">
                    <div className="news-date-box">
                      <span className="news-day">{news.date}</span>
                      <span className="news-month">{news.month}</span>
                      <span className="news-year">{news.year}</span>
                    </div>

                    <div className="news-body">
                      <span className={`news-tag ${news.tag.toLowerCase()}`}>{news.tag}</span>
                      <h4>{news.label}</h4>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="quick-links-panel">
              <h3>Quick Links</h3>
              <div className="quick-links-list">
                {quickLinks.map((link) => (
                  <button key={link} type="button" className="quick-link-item" onClick={() => onNavigate('contact')}>
                    <span className="link-icon">↗</span>
                    <span>{link}</span>
                    <span className="chevron">›</span>
                  </button>
                ))}
              </div>

              <div className="contact-card">
                <div className="contact-card-icon">🐟</div>
                <h4>Contact Us</h4>
                <p>Have a question or need technical assistance?</p>
                <button type="button" className="send-button" onClick={() => onNavigate('contact')}>
                  Send an Inquiry →
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  )
}
