import { useState } from 'react';
import { fishSpecies, forecastUpdatedKey } from '../data/fishForecast';
import FishForecastMap from '../components/FishForecastMap';
import './AdminFishForecastPage.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const today = new Date().toISOString().slice(0, 10);

export default function AdminFishForecastPage({ currentUser, onNavigate, onLogout }) {
  const [species, setSpecies] = useState('yellowfin');
  const [date, setDate] = useState(today);
  const [files, setFiles] = useState([]);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSpeciesChange = (nextSpecies) => {
    setSpecies(nextSpecies);
    setFiles([]);
    setStagedFiles([]);
    setIsPublished(false);
    setStatus('');
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!files.length) {
      setStatus('Choose at least one .shp file before clicking Add.');
      return;
    }
    setIsSaving(true);
    setStatus('');
    const formData = new FormData();
    formData.append('species', species);
    formData.append('forecastDate', date);
    files.forEach((file) => formData.append('shapes', file));
    try {
      const response = await fetch(`${apiUrl}/api/admin/fish-forecast-shapes`, { method: 'POST', body: formData });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || 'The shapefiles could not be added.');
      }
      setStagedFiles(result.files || []);
      setStatus(`${result.file_count} file${result.file_count === 1 ? '' : 's'} added. Click Publish map when ready.`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const removeFile = async (index) => {
    const stagedFile = stagedFiles[index];
    if (stagedFile) {
      try {
        const response = await fetch(`${apiUrl}/api/admin/fish-forecast-shapes/${species}/${stagedFile.id}`, { method: 'DELETE' });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'The shapefile could not be removed.');
        setStagedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
      } catch (error) {
        setStatus(error.message);
        return;
      }
    }
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setStatus('');
  };

  const handlePublish = async () => {
    setShowPublishDialog(false);
    setIsSaving(true);
    setStatus('');
    try {
      const response = await fetch(`${apiUrl}/api/admin/fish-forecast-shapes/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ species, forecastDate: date }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'The map could not be published.');
      setIsPublished(true);
      window.localStorage.setItem(forecastUpdatedKey, JSON.stringify({ species, forecastDate: date, updatedAt: Date.now() }));
      window.dispatchEvent(new Event('fis-forecast-updated'));
      setStatus(`${fishSpecies[species].label} map published for ${date}.`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="admin-forecast-shell">
      <aside className="admin-forecast-sidebar">
        <div className="admin-forecast-brand"><span>FIS</span><strong>Forecast studio</strong><small>Ocean intelligence workspace</small></div>
        <nav><button type="button" onClick={() => onNavigate('admin')}>Overview</button><button type="button" className="active">Fish forecasting</button><button type="button" onClick={() => onNavigate('adminNews')}>News &amp; events</button><button type="button" onClick={() => onNavigate('adminInquiries')}>Inquiries</button></nav>
        <div className="admin-forecast-sidebar-bottom"><span>{currentUser?.first_name || 'Admin'}</span><button type="button" onClick={onLogout}>Sign out</button></div>
      </aside>
      <section className="admin-forecast-main">
        <header className="admin-forecast-header"><div><p>Decision support / Data studio</p><h1>Publish fish forecast areas</h1><span>Upload a polygon shapefile for each species to publish its fishing areas.</span></div><a href="/services/fish-forecast" target="_blank" rel="noreferrer">View public map ↗</a></header>
        <div className="admin-forecast-grid">
          <form className="admin-forecast-form" onSubmit={handleAdd}>
            <div className="admin-form-section"><label>1. Fish species<select value={species} onChange={(event) => handleSpeciesChange(event.target.value)}>{Object.entries(fishSpecies).map(([key, item]) => <option value={key} key={key}>{item.label}</option>)}</select></label><p>{fishSpecies[species].description}</p></div>
            <div className="admin-form-section"><label>2. Forecast date<input type="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} required /></label></div>
            <div className="admin-form-section"><div className="admin-upload-heading"><div><strong>3. Fishing area shapefiles</strong><p>Select one or more polygon shapefiles (.shp), max 500 MB each.</p></div><span>{files.length} selected</span></div><label className={`admin-upload-field ${files.length ? 'ready' : ''}`}><span>Files to add<b>{files.length ? 'Ready' : 'Required'}</b></span><input type="file" accept=".shp" multiple onChange={(event) => { const selected = Array.from(event.target.files || []).filter((file) => file.size <= 500 * 1024 * 1024); setFiles(selected); setStagedFiles([]); setIsPublished(false); }} /><small>{files.length ? `${files.length} file${files.length === 1 ? '' : 's'} selected` : 'Choose one or more .shp files'}</small></label>{files.length > 0 && <div className="admin-file-list">{files.map((file, index) => <div className="admin-file-row" key={`${file.name}-${file.lastModified}`}><span title={file.name}>{file.name}</span><button type="button" onClick={() => removeFile(index)} disabled={isSaving} aria-label={`Remove ${file.name}`}>Remove</button></div>)}</div>}</div>
            {status && <div className={`admin-forecast-status ${status.includes('published') || status.includes('added') ? 'success' : 'error'}`}>{status}</div>}
            <div className="admin-forecast-actions"><button type="submit" className="admin-process-button" disabled={isSaving}><span className="admin-button-icon" aria-hidden="true">+</span>{isSaving ? 'Adding shapefiles…' : 'Add files'}</button><button type="button" className="admin-publish-button" disabled={isSaving || isPublished || !stagedFiles.length} onClick={() => setShowPublishDialog(true)}><span className="admin-button-icon" aria-hidden="true">↗</span>{isPublished ? 'Map published' : 'Publish map'}</button></div>
          </form>
          <section className="admin-forecast-preview"><div className="admin-preview-heading"><div><p>Publication workflow · {date}</p><h2>Forecast fishing areas</h2></div><span>{isPublished ? 'Published output' : files.length ? 'Ready to add' : 'Waiting for files'}</span></div>{isPublished || stagedFiles.length ? <FishForecastMap compact species={species} localFiles={files} /> : <div className="admin-forecast-empty">Add one or more shapefiles, then publish the map when the set is complete.</div>}</section>
        </div>
      </section>
      {showPublishDialog && <div className="admin-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPublishDialog(false); }}><div className="admin-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-dialog-title"><div className="admin-dialog-icon" aria-hidden="true">↗</div><h2 id="publish-dialog-title">Publish forecast map?</h2><p>Publish {stagedFiles.length} shapefile{stagedFiles.length === 1 ? '' : 's'} for {fishSpecies[species].label} dated {date}? The public map will be updated immediately.</p><div className="admin-dialog-actions"><button type="button" className="admin-dialog-cancel" onClick={() => setShowPublishDialog(false)}>Cancel</button><button type="button" className="admin-dialog-confirm" onClick={handlePublish}>Publish map</button></div></div></div>}
    </main>
  );
}
