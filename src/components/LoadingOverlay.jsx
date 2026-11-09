export default function LoadingOverlay({ message = 'Please wait...', className = '' }) {
  return (
    <div className={`loading-overlay ${className}`.trim()} role="status" aria-live="polite" aria-label={message}>
      <div className="loading-ring" aria-hidden="true" />
      <strong>{message}</strong>
    </div>
  );
}
