export default function ResearchEmptyState({
  title = "Research references",
  description = "Research papers and technical references will appear here as they are added."
}) {
  return (
    <div className="research-empty" role="status">
      <div className="research-empty__title">{title}</div>
      <p className="research-empty__desc">{description}</p>
    </div>
  );
}