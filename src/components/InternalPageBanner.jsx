export default function InternalPageBanner({ title, description }) {
  return (
    <section className="fics-page-banner">
      <div className="fics-page-banner-inner">
        <div className="fics-page-banner-eyebrow">Fisheries Information Center</div>
        <h1>{title}</h1>
        <p className="fics-page-banner-copy">{description}</p>
      </div>
    </section>
  );
}
