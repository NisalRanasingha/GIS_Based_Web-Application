import logo from '../assets/FISlogo.png';
import './AdminSidebar.css';

const links = [
  { page: 'admin', path: '/admin', icon: '⌂', label: 'Overview' },
  { page: 'adminInquiries', path: '/admin/inquiries', icon: '◫', label: 'Inquiries' },
  { page: 'adminNews', path: '/admin/news', icon: '✦', label: 'News & events' },
  { page: 'adminFishForecast', path: '/admin/fish-forecast', icon: '◉', label: 'Fish forecasting' },
];

export default function AdminSidebar({ activePage, currentUser, onNavigate, onLogout, inquiryCount = 0 }) {
  const navigate = (event, page) => {
    event.preventDefault();
    onNavigate(page);
  };

  return (
    <aside className="admin-sidebar">
      <a className="admin-sidebar-brand" href="/admin" onClick={(event) => navigate(event, 'admin')}>
        <img src={logo} alt="" />
        <span><strong>Receh<span>FIS</span></strong><small>Admin workspace</small></span>
      </a>
      <p className="admin-sidebar-label">Workspace</p>
      <nav className="admin-sidebar-nav" aria-label="Admin navigation">
        {links.map(({ page, path, icon, label }) => (
          <a className={activePage === page ? 'active' : ''} href={path} onClick={(event) => navigate(event, page)} key={page}>
            <span>{icon}</span>{label}{page === 'adminInquiries' && inquiryCount > 0 && <b>{inquiryCount}</b>}
          </a>
        ))}
        <p className="admin-sidebar-label secondary">General</p>
        <button type="button" className={`admin-sidebar-profile ${activePage === 'adminProfile' ? 'active' : ''}`} onClick={() => onNavigate('adminProfile')}><span>⚙</span>Profile settings</button>
      </nav>
      <div className="admin-sidebar-footer">
        <span>{currentUser?.first_name || 'Admin'}</span>
        <button type="button" onClick={onLogout}>Sign out</button>
      </div>
    </aside>
  );
}
