export function Icon({ children, className = "", filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 24` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
