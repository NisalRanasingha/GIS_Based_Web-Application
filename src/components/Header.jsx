const navItems = [
  'Home',
  'About Us',
  'Services',
  'Research',
  'Publications',
  'News & Events',
  'Contact Us',
]

export default function Header({ onNavigate }) {
  return (
    <header className="site-header">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>Ministry of Fisheries, Sri Lanka</span>
          <div className="top-strip-actions">
            <button type="button" className="language-trigger">English</button>
            <button type="button" className="language-flag">සිංහල</button>
            <button type="button" className="language-flag">தமிழ்</button>
          </div>
        </div>
      </div>

      <div className="brand-row">
        <div className="container brand-row-inner">
          <div className="brand-box">
            <div className="brand-icon">🐟</div>
            <div className="brand-copy-block">
              <div className="brand-kicker">FISHERIES INFORMATION CENTER</div>
              <h1>National Aquatic Resources Research and Development Agency</h1>
              <small>Ministry of Fisheries, Sri Lanka</small>
            </div>
          </div>

          <div className="country-badge">
            <div className="country-mark">🐻</div>
            <span>SRI LANKA</span>
          </div>
        </div>
      </div>

      <nav className="main-nav">
        <div className="container main-nav-inner">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              className={item === 'Home' || item === 'Contact Us' ? 'nav-link active' : 'nav-link'}
              onClick={() => onNavigate(item === 'Contact Us' ? 'contact' : 'home')}
            >
              {item}
            </button>
          ))}

          <button type="button" className="search-button" aria-label="Search">
            🔍 Search
          </button>
        </div>
      </nav>
    </header>
  )
}
