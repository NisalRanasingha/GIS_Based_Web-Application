export default function Footer({ onNavigate }) {
  const footerLinks = ['Privacy Policy', 'Disclaimer', 'Sitemap', 'RTI Act', 'Tenders', 'Vacancies']

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-branding">
          <div className="footer-logo-wrap">
            <div className="footer-logo">🐟</div>
            <div>
              <h4>Fisheries Information Center</h4>
              <small>NARA, Sri Lanka</small>
            </div>
          </div>

          <p>
            The Fisheries Information Center at NARA provides research, data, and advisory services to
            support Sri Lanka&apos;s fisheries and aquatic resources sector.
          </p>

          <div className="mini-badges">
            <span>FB</span>
            <span>TW</span>
            <span>YT</span>
          </div>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            {['Fish Landing Statistics', 'Vessel Registration Portal', 'Licensing & Permits', 'Research Grants', 'Fisheries Act 2026', 'Marine Protected Areas'].map((link) => (
              <li key={link}>{link}</li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <h4>Contact Us</h4>
          <ul className="contact-list">
            <li>NARA, Crow Island, Mattakkuliya, Colombo 15, Sri Lanka</li>
            <li>+94 11 2522 189 • Fax: +94 11 2521 932</li>
            <li>fic@nara.ac.lk</li>
            <li>Monday – Friday: 8:30 AM – 4:30 PM</li>
          </ul>
          <button type="button" className="footer-cta" onClick={() => onNavigate('contact')}>
            Contact Us →
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2026 National Aquatic Resources Research and Development Agency (NARA), Sri Lanka. All rights reserved.</span>
          <div className="footer-links">
            {footerLinks.map((link) => (
              <span key={link}>{link}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
