import Button from "../components/common/Button";

export default function NotFound() {
  return (
    <div className="page" style={{ paddingTop: "var(--nav-height)" }}>
      <div className="container">
        <div className="notfound">
          <div className="notfound__code">404</div>
          <h1 className="notfound__title">Page not found</h1>
          <p className="notfound__desc">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="final-cta__actions">
            <Button to="/" variant="primary" size="lg">
              Back to Home
            </Button>
            <Button to="/analyze" variant="secondary" size="lg">
              Analyze an Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}