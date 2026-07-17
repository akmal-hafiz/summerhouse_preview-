export default function VillaDetailLoading() {
  return (
    <main className="villa-detail-page villa-detail-page--preview">
      <section className="villa-detail-stage">
        <div className="villa-detail-frame">
          <div className="villa-detail-loading" aria-label="Loading villa details" role="status">
            <div className="villa-detail-loading__bar" />
            <div className="villa-detail-loading__title" />
            <div className="villa-detail-loading__meta" />
            <div className="villa-detail-loading__gallery">
              <div className="villa-detail-loading__hero" />
              <div className="villa-detail-loading__side">
                <div />
                <div />
              </div>
            </div>
            <div className="villa-detail-loading__lines">
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
