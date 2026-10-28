import Button from "../common/Button";

export default function UploadCTA() {
  return (
    <section className="upload-cta" aria-labelledby="upload-cta-title">
      <div className="container upload-cta__inner">
        <div>
          <h2 id="upload-cta-title" className="upload-cta__title">
            Start with an image.
          </h2>
          <p className="upload-cta__text">
            Upload a wrist or ankle X-ray to begin an AI-assisted analysis.
          </p>
        </div>
        <div className="upload-cta__actions">
          <Button to="/analyze" variant="primary" size="lg">
            Analyze an Image
          </Button>
        </div>
      </div>
    </section>
  );
}