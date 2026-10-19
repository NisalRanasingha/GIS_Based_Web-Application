export default function LoadingOverlay({ message = 'Please wait...' }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label={message}>
      <div className="loading-ring" aria-hidden="true" />
      <strong>{message}</strong>
    </div>
  );
}
