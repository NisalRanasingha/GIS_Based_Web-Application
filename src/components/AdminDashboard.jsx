function AdminDashboard({ currentUser, onLogout }) {
  return (
    <main style={{ padding: '2rem', minHeight: '100vh', background: '#f4f8fb', color: '#0a3d72' }}>
      <section style={{ maxWidth: '1100px', margin: '0 auto', background: '#ffffff', borderRadius: '18px', padding: '2rem', boxShadow: '0 18px 40px rgba(10, 61, 114, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem', color: '#f4b740' }}>Admin Panel</p>
            <h1 style={{ margin: '0.5rem 0 0', fontSize: '2rem' }}>Welcome, {currentUser?.first_name || 'Admin'}</h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={onLogout} style={{ ...buttonStyle, background: '#d32f2f' }}>Logout</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {cards.map(({ title, value, accent }) => (
            <div key={title} style={{ background: accent, borderRadius: '14px', padding: '1.25rem', color: '#fff' }}>
              <p style={{ margin: 0, opacity: 0.88, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</p>
              <h2 style={{ margin: '0.75rem 0 0', fontSize: '2rem' }}>{value}</h2>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', background: '#f7fafc', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Admin details</h3>
          <p><strong>Email:</strong> {currentUser?.email}</p>
          <p><strong>Role:</strong> {currentUser?.role}</p>
        </div>
      </section>
    </main>
  )
}

const cards = [
  { title: 'Users', value: '1,240', accent: '#0a3d72' },
  { title: 'Active Boats', value: '318', accent: '#f4b740' },
  { title: 'Reports', value: '86', accent: '#2e8b57' },
  { title: 'Alerts', value: '12', accent: '#d97706' },
]

const buttonStyle = {
  border: 'none',
  borderRadius: '10px',
  background: '#0a3d72',
  color: '#fff',
  padding: '0.8rem 1.1rem',
  fontWeight: 700,
  cursor: 'pointer',
}

export default AdminDashboard
