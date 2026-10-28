export default function Disclaimer({ compact = false }) {
  if (compact) {
    return (
      <p className="inline-disclaimer">
        MedScope is a research and educational prototype. Results are
        AI-assisted and non-diagnostic. A high confidence score does not mean a
        finding is medically confirmed. Always consult a qualified healthcare
        professional.
      </p>
    );
  }

  return (
    <section className="disclaimer-section" aria-labelledby="disclaimer-title">
      <div className="container">
        <h2 id="disclaimer-title" className="disclaimer-section__title">
          AI-assisted.
          <br />
          Not a diagnosis.
        </h2>

        <p className="disclaimer-section__text">
          MedScope is a research and educational prototype. Its results may be
          incorrect and must not replace evaluation by a qualified healthcare
          professional.
        </p>

        <div className="disclaimer-section__callout">
          A high confidence score does not mean that a finding is medically
          confirmed.
        </div>
      </div>
    </section>
  );
}