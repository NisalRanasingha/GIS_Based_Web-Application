import fishingActPdf from '../assets/logo/02-2016_E_1784552773.pdf'

const vesselManagementUrl = 'https://fisheriesdept.gov.lk/regulations/'
const libraryUrl = 'http://www.nara.ac.lk/?page_id=3373'
const rightToInformationUrl = 'http://www.nara.ac.lk/?page_id=20339'
const naraNewsUrl = 'http://www.nara.ac.lk/?page_id=20299'

export default function Footer({ onNavigate }) {
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

          <div className="footer-emblem">
            <img src="/services/Emblem_of_Sri_Lanka.svg" alt="Emblem of Sri Lanka" />
          </div>
        </div>
        

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            {[
              { label: 'Library and Information Center', href: libraryUrl, external: true },
              { label: 'Vessel Registration and Management', href: vesselManagementUrl, external: true },
              { label: 'Right to Information', href: rightToInformationUrl, external: true },
              { label: 'NARA News', href: naraNewsUrl, external: true },
              { label: 'Fisheries Act 2016', href: fishingActPdf, external: true },
              { label: 'Marine Protected Areas', href: '#', onClick: () => onNavigate('marineProtectedAreas') },
            ].map((link) => (
              <li key={link.label}>
                {link.href ? <a href={link.href} onClick={link.onClick ? (event) => { event.preventDefault(); link.onClick(); } : undefined} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>{link.label}</a> : link.label}
              </li>
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
          <span>© 2026 Fisheries Information Center (NARA), Sri Lanka. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
