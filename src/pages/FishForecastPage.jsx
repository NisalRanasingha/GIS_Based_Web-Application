import { useCallback, useEffect, useState } from 'react';
import FISFooter from '../components/FISFooter';
import FISHeader from '../components/FISHeader';
import FishForecastMap from '../components/FishForecastMap';
import { fishSpecies, forecastUpdatedKey } from '../data/fishForecast';
import './FishForecastPage.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FishForecastPage({ onNavigate, currentUser, onLogout, embedded = false, weeklySummary = false }) {
  const [species, setSpecies] = useState('yellowfin');
  const [forecasts, setForecasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadForecasts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/fish-forecasts?species=${species}`);
      if (!response.ok) throw new Error('Forecast service is unavailable.');
      const result = await response.json();
      setForecasts(result.forecasts || []);
      setError('');
    } catch (loadError) {
      setForecasts([]);
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [species]);

  useEffect(() => {
    // Loading is an external synchronization with the forecast API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadForecasts();
  }, [loadForecasts]);
  useEffect(() => {
    const refresh = () => void loadForecasts();
    const handleStorage = (event) => {
      if (event.key === forecastUpdatedKey) refresh();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('fis-forecast-updated', refresh);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('fis-forecast-updated', refresh);
    };
  }, [loadForecasts]);
  const activeSpecies = fishSpecies[species];

  return (
    <div className="nara-responsive flex min-h-screen flex-col bg-[#edf3f7] text-[#123d7b]">
      {!embedded && <FISHeader page="services" onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />}
      <main className="flex-1">
        {!embedded && <section className="fish-forecast-hero">
          <div><p className="fics-page-banner-eyebrow">Fisheries Information Center · Decision support</p><h1>Fish forecasting</h1><p>Explore daily habitat suitability layers and plan a safer, more efficient trip from your nearest harbour.</p></div>
          <div className="fish-forecast-hero-badge"><span>LIVE MODEL</span><strong>7-day view</strong><small>Updated by NARA analysts</small></div>
        </section>}
        <section className={`fish-forecast-content ${embedded ? 'fish-forecast-content-embedded' : ''}`}>
          <div className="fish-forecast-heading"><div><p className="forecast-eyebrow">{weeklySummary ? 'Weekly summary' : 'Species selector'}</p><h2>{weeklySummary ? 'Past seven days of forecast areas' : 'Find the water that fits your catch'}</h2><p>Select a species from the map toolbar to view its latest ocean-data forecast and past seven days of model output.</p></div>{!weeklySummary && <button type="button" className="weekly-summary-button" onClick={() => onNavigate('weeklySummary')}>View weekly summary →</button>}</div>
          <div className="fish-forecast-model-note"><strong>{activeSpecies.label}</strong><span>{activeSpecies.description}</span><em>{activeSpecies.requirements.length} data layers</em></div>
          {error && <div className="forecast-inline-alert">Live forecast service unavailable. No unprocessed demonstration data is shown.</div>}
          {isLoading ? <div className="forecast-loading">Loading forecast layers…</div> : <FishForecastMap forecasts={forecasts} species={species} onSpeciesChange={setSpecies} />}
          <div className="forecast-disclaimer"><strong>Use responsibly</strong><span>Forecast cells indicate relative habitat suitability, not guaranteed catches. Check official weather and safety advisories before sailing.</span></div>
        </section>
      </main>
      {!embedded && <FISFooter onNavigate={onNavigate} />}
    </div>
  );
}
