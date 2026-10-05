export default function CenterAlert({ type, message, onClose }) {
  if (!message) return null;

  return (
    <div className="center-alert-backdrop" role="presentation">
      <div className={`center-alert ${type}`} role="alertdialog" aria-modal="true" aria-label={type === 'success' ? 'Success' : 'Error'}>
        <div className="center-alert-icon" aria-hidden="true">{type === 'success' ? '✓' : '!'}</div>
        <strong>{type === 'success' ? 'Success' : 'Something went wrong'}</strong>
        <p>{message}</p>
        <button type="button" onClick={onClose}>Continue</button>
      </div>
    </div>
  );
}
