export default function ErrorMessage({ title = "Something went wrong.", children }) {
  return (
    <div className="error-message" role="alert">
      <span className="error-message__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </span>
      <div>
        <div className="error-message__title">{title}</div>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}