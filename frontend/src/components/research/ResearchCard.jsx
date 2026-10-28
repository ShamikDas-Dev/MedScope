export default function ResearchCard({ paper }) {
  const { title, authors, journal, year, description, link, category } = paper;

  return (
    <article className="research-card">
      {category && <span className="research-card__category">{category}</span>}
      {title && <h3 className="research-card__title">{title}</h3>}

      {(authors || journal || year) && (
        <p className="research-card__meta">
          {authors}
          {authors && (journal || year) ? " · " : ""}
          {journal}
          {journal && year ? " · " : ""}
          {year}
        </p>
      )}

      {description && <p className="research-card__desc">{description}</p>}

      {link && (
        <a
          className="research-card__link"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read reference →
        </a>
      )}
    </article>
  );
}