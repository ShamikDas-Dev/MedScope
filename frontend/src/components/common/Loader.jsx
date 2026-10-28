export default function Loader({ size = "md", label = "Loading" }) {
  return (
    <span
      className={`loader ${size === "lg" ? "loader--lg" : ""}`}
      role="status"
      aria-label={label}
    />
  );
}