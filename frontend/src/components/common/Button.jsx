import { Link } from "react-router-dom";

/**
 * Button / Link button.
 *
 * Props:
 *  - variant: "primary" | "secondary" | "ghost" | "danger"
 *  - size: "sm" | "md" | "lg"
 *  - to: react-router path -> renders <Link>
 *  - href: external URL -> renders <a>
 *  - block: full width
 *  - loading: shows a spinner + disables
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  href,
  type = "button",
  disabled = false,
  loading = false,
  block = false,
  className = "",
  ...rest
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    size === "lg" ? "btn--lg" : size === "sm" ? "btn--sm" : "",
    block ? "btn--block" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading && <span className="loader" aria-hidden="true" />}
      <span>{children}</span>
    </>
  );

  const isDisabled = disabled || loading;

  if (to && !isDisabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href && !isDisabled) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}