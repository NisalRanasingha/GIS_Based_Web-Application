import FISFooter from '../components/FISFooter';
import FISHeader from '../components/FISHeader';
import './MarineProtectedAreasPage.css';

const protectedAreas = [
  { name: "Adam's Bridge Marine National Park", location: 'Mannar District', mapQuery: "Adam's Bridge Marine National Park, Mannar, Sri Lanka", description: 'A shallow island and reef ecosystem supporting migratory birds, seagrass, coral communities, and coastal wildlife.', image: "/services/Adam's Bridge Marine National Park.jpg" },
  { name: 'Pigeon Island National Park', location: 'Nilaveli, Trincomalee', mapQuery: 'Pigeon Island National Park, Nilaveli, Trincomalee, Sri Lanka', description: 'Famous for coral reefs, reef fish, and exceptional marine biodiversity, making it a premier snorkeling and diving destination.', image: '/services/Pigeon Island National Park.jpg' },
  { name: 'Hikkaduwa National Park', location: 'Hikkaduwa, Galle', mapQuery: 'Hikkaduwa National Park, Hikkaduwa, Sri Lanka', description: 'Protects coral reefs and associated marine life along one of Sri Lanka’s best-known reef coastlines.', image: '/services/Hikkaduwa National Park.jpg' },
  { name: 'Bar Reef Marine Sanctuary', location: 'Kalpitiya, Puttalam', mapQuery: 'Bar Reef Marine Sanctuary, Kalpitiya, Sri Lanka', description: 'One of Sri Lanka’s important coral reef ecosystems, with rich fish, reef, and coastal habitats.', image: '/services/Bar Reef Marine Sanctuary.jpg' },
  { name: 'Kayankerni Marine Sanctuary', location: 'Kayankerni, Batticaloa', mapQuery: 'Kayankerni Marine Sanctuary, Batticaloa, Sri Lanka', description: 'A protected eastern coastline with coral, seagrass, and shallow-water habitats.', image: '/services/Kayankerni Marine Sanctuary.jpg' },
  { name: 'Great and Little Basses Marine Sanctuary', location: 'Yala, Hambantota', mapQuery: 'Great Basses Reef and Little Basses Reef, Yala, Sri Lanka', description: 'Offshore reef and rocky-islet habitats that support diverse marine species.', image: '/services/Great and Little Basses Marine Sanctuary.jpg' },
  { name: 'Rumassala Marine Sanctuary', location: 'Rumassala, Galle', mapQuery: 'Rumassala, Unawatuna, Galle, Sri Lanka', description: 'A biologically rich coastal sanctuary adjoining the historic Rumassala headland.', image: '/services/Rumassala Marine Sanctuary.jpg' },
  { name: 'Vankalai Sanctuary', location: 'Vankalai, Mannar', mapQuery: 'Vankalai Sanctuary, Mannar, Sri Lanka', description: 'A wetland and coastal sanctuary important for shorebirds and marine-linked ecosystems.', image: '/services/Vankalai Sanctuary.jpg' },
];

const googleMapsUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export default function MarineProtectedAreasPage({ onNavigate, currentUser, onLogout }) {
  return (
    <div className="marine-areas-page">
      <FISHeader page="marineProtectedAreas" onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />
      <main>
        <section className="marine-areas-hero">
          <div><p className="fics-page-banner-eyebrow">Fisheries Information Center · Conservation</p><h1>Marine Protected Areas</h1><p>Explore Sri Lanka’s protected coastal waters, coral reefs, sanctuaries, and marine habitats.</p></div>
          <div className="marine-areas-hero-badge"><span>8</span><small>featured<br />areas</small></div>
        </section>
        <section className="marine-areas-content">
          <div className="marine-section-heading"><div><p>Conservation network</p><h2>Major Marine Protected Areas</h2></div><span>Protecting blue ecosystems for future generations</span></div>
          <p className="marine-intro">Some important officially designated marine protected areas include national parks, marine sanctuaries, and coastal conservation areas. Select a location to open it in Google Maps.</p>
          <div className="marine-areas-grid">
            {protectedAreas.map((area, index) => <article className="marine-area-card" key={area.name}>
              <img src={area.image} alt={area.name} loading="lazy" />
              <div className="marine-area-card-body"><span className="marine-area-number">{String(index + 1).padStart(2, '0')}</span><p className="marine-area-location">📍 {area.location}</p><h3>{area.name}</h3><p>{area.description}</p><a href={googleMapsUrl(area.mapQuery)} target="_blank" rel="noreferrer">View on Google Maps <span>↗</span></a></div>
            </article>)}
          </div>
          <section className="marine-note"><div><span className="marine-note-icon">◎</span><div><h2>Other protected areas with marine components</h2><p>Yala, Kumana, Bundala, and Delft also include important marine and coastal habitats.</p></div></div><a href="https://www.google.com/maps/search/?api=1&query=marine+protected+areas+Sri+Lanka" target="_blank" rel="noreferrer">Explore Sri Lanka <span>↗</span></a></section>
          <section className="marine-gis-section"><div className="marine-section-heading"><div><p>For mapping and research</p><h2>GIS data for Marine Protected Areas</h2></div></div><div className="marine-gis-grid"><div><span className="marine-gis-icon">⌖</span><h3>Marine Protected Area Network Mapping · 2025</h3><p>Available data includes marine sanctuary, national park, fisheries management, special management, and important habitat boundaries in GIS shapefile format.</p></div><div className="marine-resource-links"><a href="https://jncc.gov.uk/resources/a1c07292-fd83-4d3a-9866-d8d5845743e0" target="_blank" rel="noreferrer">Download MPA GIS shapefiles (JNCC) <span>↗</span></a><a href="https://www.efl.lk/maps/" target="_blank" rel="noreferrer">View Sri Lanka MPA network maps (EFL) <span>↗</span></a></div></div><p className="marine-disclaimer"><strong>Important clarification:</strong> Different sources report different numbers because some count only officially designated MPAs, while others include national parks with marine components, fisheries management areas, and special management areas.</p></section>
        </section>
      </main>
      <FISFooter onNavigate={onNavigate} />
    </div>
  );
}
