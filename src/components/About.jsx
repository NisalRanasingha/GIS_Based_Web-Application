import { useState } from 'react'
import './About.css'

const activities = [
  'Supporting sustainable fisheries through practical research, accurate data, and responsible resource management.',
  'Working with coastal communities and partners to protect marine habitats and strengthen local livelihoods.',
  'Sharing trusted fisheries information so decisions can be made with clarity, confidence, and care.',
  'Building knowledge through field surveys, monitoring programs, and collaboration across the marine sector.',
  'Contributing to a healthier ocean through science-led policy, education, and conservation initiatives.',
]

function About({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = (page) => {
    setMenuOpen(false)
    onNavigate(page)
  }

  return (
    <div className="about-page">
      <header className="site-header">
        <a className="site-brand" href="#about" onClick={(event) => { event.preventDefault(); navigate('about') }}>
          <span className="brand-mark" aria-hidden="true">FI</span>
          <span>Fisheries Information Center</span>
        </a>

        <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <a href="#home" onClick={(event) => { event.preventDefault(); navigate('login') }}>Home</a>
          <a href="#resources">Resources</a>
          <a className="is-active" href="#about" aria-current="page">About Us</a>
          <a href="#contact">Contact</a>
          <button className="account-button" type="button" onClick={() => navigate('login')}>Account</button>
        </nav>
      </header>

      <main>
        <section className="about-hero">
          <div className="page-width">
            <p className="eyebrow">Fisheries Information Center</p>
            <h1>About us</h1>
            <p className="hero-copy">Connecting people, research, and the ocean through dependable fisheries information.</p>
          </div>
        </section>

        <div className="page-width about-content">
          <section className="intro-section">
            <div className="section-heading">
              <span className="heading-line" />
              <h2>About us</h2>
            </div>
            <div className="intro-grid">
              <img
                src="/nara_cover.jpg"
                alt="National Aquatic Resources Research and Development Agency building"
              />
              <div className="intro-text">
                <p>The Fisheries Information Center at NARA provides research, data, and advisory services to support Sri Lanka&apos;s fisheries and aquatic resources sector.</p>
                <p>We bring together reliable knowledge and the people who use it, helping communities, researchers, and decision-makers understand the waters that sustain us.</p>
              </div>
            </div>
          </section>

          <section className="activities-section">
            <div className="section-heading">
              <span className="heading-line" />
              <h2>Our activities</h2>
            </div>
            <ul className="activity-list">
              {activities.map((activity) => <li key={activity}>{activity}</li>)}
            </ul>
          </section>

          <img className="feature-image" src="/aboutus.jpg" alt="A school of fish swimming through a blue reef" />
        </div>
      </main>

      <footer className="site-footer" id="contact">
        <div className="page-width footer-grid">
          <div className="footer-about">
            <a className="site-brand footer-brand" href="#about" onClick={(event) => { event.preventDefault(); navigate('about') }}>
              <span className="brand-mark" aria-hidden="true">FI</span>
              <span>Fisheries Information Center</span>
            </a>
            <p>Reliable fisheries research, data, and advisory services to support Sri Lanka&apos;s fisheries and aquatic resources sector.</p>
          </div>
          <div>
            <h3>Quick links</h3>
            <a href="#statistics">Fisheries Landing Statistics</a>
            <a href="#vessel">Vessel Registration Portal</a>
            <a href="#licensing">Licensing &amp; Permits</a>
          </div>
          <div>
            <h3>Contact us</h3>
            <p>NARA, Crow Island, Mattakkuliya, Colombo 15, Sri Lanka</p>
            <p>+94 11 252 1899</p>
            <a href="mailto:fic@nara.ac.lk">fic@nara.ac.lk</a>
            <a className="footer-button" href="mailto:fic@nara.ac.lk">Contact us <span aria-hidden="true">-&gt;</span></a>
          </div>
        </div>
        <div className="footer-bottom"><div className="page-width"><span>© 2026 National Aquatic Resources Research and Development Agency (NARA), Sri Lanka.</span><span>Privacy Policy &nbsp; Disclaimer &nbsp; Sitemap</span></div></div>
      </footer>
    </div>
  )
}

export default About