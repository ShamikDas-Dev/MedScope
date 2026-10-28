import ResearchCard from "./ResearchCard";
import ResearchEmptyState from "./ResearchEmptyState";

/**
 * Renders a category of research papers, or an empty state when none exist.
 */
export default function ResearchSection({
  title,
  description,
  papers = [],
  emptyTitle,
  emptyDescription
}) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <header style={{ marginBottom: "var(--space-5)" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 600,
            marginBottom: description ? "var(--space-2)" : 0
          }}
        >
          {title}
        </h2>
        {description && (
          <p style={{ color: "var(--color-muted)", fontSize: 15, maxWidth: 680 }}>
            {description}
          </p>
        )}
      </header>

      {papers.length === 0 ? (
        <ResearchEmptyState
          title={emptyTitle || "No references added yet"}
          description={
            emptyDescription ||
            "References for this section will appear here as they are added."
          }
        />
      ) : (
        <div className="research-grid">
          {papers.map((paper, idx) => (
            <ResearchCard key={paper.id || `${title}-${idx}`} paper={paper} />
          ))}
        </div>
      )}
    </section>
  );
}