const ROADMAP = [
  {
    phase: "Now",
    tag: "V1",
    items: ["X-Ray", "Wrist", "Ankle", "Fracture Screening"],
    current: true
  },
  {
    phase: "Next",
    tag: "Planned",
    items: ["More X-Ray Anatomies", "Additional Analysis Tasks", "Improved Localization"],
    current: false
  },
  {
    phase: "Future",
    tag: "Future",
    items: ["MRI", "CT", "Multi-Modal Analysis"],
    current: false
  }
];

export default function Roadmap() {
  return (
    <div className="roadmap">
      {ROADMAP.map((col) => (
        <div
          key={col.phase}
          className={`roadmap__col ${col.current ? "roadmap__col--now" : ""}`}
        >
          <div className="roadmap__phase">
            <span>{col.phase}</span>
            <span className="roadmap__phase-tag">{col.tag}</span>
          </div>
          <ul className="roadmap__list">
            {col.items.map((item) => (
              <li
                key={item}
                className={`roadmap__item ${!col.current ? "roadmap__item--future" : ""}`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}