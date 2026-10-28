import SectionHeading from "../components/common/SectionHeading";
import ResearchSection from "../components/research/ResearchSection";
import { researchPapers, researchCategories } from "../data/research";

export default function Research() {
  const byCategory = (category) =>
    researchPapers.filter(
      (p) => (p.category || "").toLowerCase() === category.toLowerCase()
    );

  const uncategorised = researchPapers.filter((p) => !p.category);
      const references = [
    {
      title: "Research Paper 1",
      authors: "Authors of the paper",
      year: "2022",
      description: "Description of the research.",
      file: "/research/papers/paper-1.pdf",
    },
    {
      title: "Research Paper 2",
      authors: "Authors of the paper",
      year: "2022",
      description: "Description of the research.",
      file: "/research/papers/paper-2.pdf",
    },
    {
      title: "Research Paper 3",
      authors: "Authors of the paper",
      year: "2018",
      description: "Description of the research.",
      file: "/research/papers/paper-3.pdf",
    },
    {
      title: "Research Paper 4",
      authors: "Authors of the paper",
      year: "2019",
      description: "Description of the research.",
      file: "/research/papers/paper-4.pdf",
    },
  ];

  return (
    <div className="page" style={{ paddingTop: "var(--nav-height)" }}>
      <div className="container">
        <header className="page-header">
          <span className="eyebrow">Research</span>
          <h1 className="page-header__title">Research behind MedScope</h1>
          <p className="page-header__subtitle">
            MedScope is designed around published research in medical imaging,
            fracture detection, explainable AI, and medical multimodal models.
            References are listed here once verified and added.
          </p>
        </header>

        <section className="section" style={{ paddingTop: 0 }}>
          <SectionHeading
            eyebrow="Overview"
            title="Research overview"
            description="The platform's design draws on established literature. This page will list specific references as they are reviewed and added."
          />

          <div className="research-sections">
            {researchCategories.map((cat) => {
              const count = byCategory(cat).length;
              return (
                <div key={cat} className="research-topic">
                  <div className="research-topic__label">{cat}</div>
                  <div className="research-topic__status">
                    {count > 0
                      ? `${count} reference${count === 1 ? "" : "s"}`
                      : "No references added yet"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <ResearchSection
          title="Reference papers"
          description="Verified papers, technical references, and methodology notes."
          papers={researchPapers}
        />

        {uncategorised.length > 0 && (
          <ResearchSection
            title="Additional references"
            description="References without an assigned category."
            papers={uncategorised}
          />
        )}

        <section className="section">
          <SectionHeading
            eyebrow="Methodology"
            title="Model approach"
            description="Notes on architecture, training, and evaluation will be added alongside concrete references."
          />
          <div className="research-empty" role="status">
            <div className="research-empty__title">Methodology notes</div>
            <p className="research-empty__desc">
              Model architecture, dataset, and evaluation details will appear here
              as they are documented and verified.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}