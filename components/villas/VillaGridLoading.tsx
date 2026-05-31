import React from "react";

const VillaGridLoading = () => {
  return (
    <div className="villa-collection-grid">
      {[...Array(6)].map((_, i) => (
        <article className="villa-catalog-card villa-catalog-card--loading" key={i}>
          <div className="villa-catalog-card__media" />
          <div className="villa-catalog-card__body">
            <span />
            <span />
            <span />
          </div>
        </article>
      ))}
    </div>
  );
};

export default VillaGridLoading;
