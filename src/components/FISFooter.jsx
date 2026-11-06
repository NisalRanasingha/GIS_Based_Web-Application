import logo from '../assets/FISlogo.png';
import fishingActPdf from '../assets/logo/02-2016_E_1784552773.pdf';

const libraryUrl = 'http://www.nara.ac.lk/?page_id=3373';
const rightToInformationUrl = 'http://www.nara.ac.lk/?page_id=20339';
const naraNewsUrl = 'http://www.nara.ac.lk/?page_id=20299';
const quickLinks = [
  { label: 'Library and Information Center', href: libraryUrl, external: true },
  { label: 'Vessel Registration and Management', href: 'https://fisheriesdept.gov.lk/regulations/', external: true },
  { label: 'Right to Information', href: rightToInformationUrl, external: true },
  { label: 'NARA News', href: naraNewsUrl, external: true },
  { label: 'Fisheries Act 2016', href: fishingActPdf, external: true },
  { label: 'Marine Protected Areas', page: 'marineProtectedAreas' },
];

export default function FISFooter({ onNavigate }) {
  return (
    <footer className="mt-auto bg-[#061d3d] text-white">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_1fr_1.1fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white p-1">
              <img src={logo} alt="FIS logo" className="h-11 w-11 object-contain" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-white">Fisheries Information Center</div>
              <div className="text-[12px] text-white/70">NARA, Sri Lanka</div>
            </div>
          </div>
          <p className="max-w-md text-[13px] leading-7 text-white/70">
            The Fisheries Information Center at NARA provides research, data, and advisory services to support Sri Lanka's fisheries and aquatic resources sector.
          </p>
          <div className="mx-auto mt-5 flex h-28 w-56 items-center justify-between gap-5 rounded-sm bg-white px-5 py-3">
            <img src="/services/Emblem_of_Sri_Lanka.svg" alt="Government emblem of Sri Lanka" className="h-full w-20 object-contain" />
            <img src="/services/NARA.jpg" alt="NARA logo" className="h-full w-20 object-contain" />
          </div>
        </div>

        <div>
          <h3 className="border-b border-white/10 pb-3 text-xl font-bold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-3">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <a href={item.href || '#'} onClick={item.page ? (event) => { event.preventDefault(); onNavigate(item.page); } : undefined} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} className="flex items-center gap-2 text-[13px] text-white/70 transition hover:text-white">
                  <span className="text-[#f4b740]">›</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="border-b border-white/10 pb-3 text-xl font-bold text-white">Contact Us</h3>
          <div className="mt-4 space-y-3 text-[13px] leading-7 text-white/70">
            <div className="flex gap-2"><span>📍</span><span>NARA, Crow Island, Mattakkuliya, Colombo 15, Sri Lanka</span></div>
            <div className="flex gap-2"><span>📞</span><span>+94 11 2522 189 · Fax: +94 11 2521 932</span></div>
            <div className="flex gap-2"><span>✉️</span><span>fis@nara.ac.lk</span></div>
            <div className="flex gap-2"><span>🕒</span><span>Monday – Friday: 8:30 AM – 4:30 PM</span></div>
          </div>
          <button onClick={() => onNavigate('contact')} className="mt-5 rounded-sm bg-[#f4b740] px-5 py-3 text-sm font-bold text-[#0a3d72] transition hover:bg-[#e7a330]">
            Contact Us →
          </button>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-4 text-[12px] text-white/50 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>© 2026 Fisheries Information Center (NARA), Sri Lanka. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
