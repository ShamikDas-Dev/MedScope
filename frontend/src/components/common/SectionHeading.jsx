export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2"
}) {
  return (
    <div className={`section-heading ${align === "center" ? "section-heading--center" : ""}`}>
      {eyebrow && <span className="eyebrow section-heading__eyebrow">{eyebrow}</span>}
      {title && <Tag className="section-heading__title">{title}</Tag>}
      {description && <p className="section-heading__desc">{description}</p>}
    </div>
  );
}