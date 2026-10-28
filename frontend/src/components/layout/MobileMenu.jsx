import { NavLink } from "react-router-dom";
import Button from "../common/Button";

export default function MobileMenu({ open, onClose, links }) {
  return (
    <div
      id="mobile-menu"
      className={`mobile-menu ${open ? "mobile-menu--open" : ""}`}
      aria-hidden={!open}
    >
      <nav className="mobile-menu__inner" aria-label="Mobile">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className={({ isActive }) =>
              `mobile-menu__link ${isActive ? "mobile-menu__link--active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
        <div className="mobile-menu__cta">
          <Button to="/analyze" variant="primary" size="lg" block onClick={onClose} tabIndex={open ? 0 : -1}>
            Analyze an Image
          </Button>
        </div>
      </nav>
    </div>
  );
}