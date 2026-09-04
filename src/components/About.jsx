import './About.css'
import FISHeader from './FISHeader'
import FISFooter from './FISFooter'

const activities = [
  'Supporting sustainable fisheries through practical research, accurate data, and responsible resource management.',
  'Working with coastal communities and partners to protect marine habitats and strengthen local livelihoods.',
  'Sharing trusted fisheries information so decisions can be made with clarity, confidence, and care.',
  'Building knowledge through field surveys, monitoring programs, and collaboration across the marine sector.',
  'Contributing to a healthier ocean through science-led policy, education, and conservation initiatives.',
]

function About({ onNavigate }) {
  return (
    <div className="about-page">
    <FISHeader page="about" onNavigate={onNavigate} />

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

      <FISFooter onNavigate={onNavigate} />
    </div>
  )
}

export default About