// Placeholder rows shaped like a dashboard list row while the list loads. Uses the site's shared `.skeleton` shimmer.
export default function DashboardSkeletonRows({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div className="dash-stay-list" role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <div className="dash-list-row dash-list-row--skeleton" key={index} aria-hidden="true">
          <div className="dash-list-row-main">
            <span className="skeleton" />
            <span className="skeleton" />
          </div>
          <span className="skeleton dash-list-row-skeleton-action" />
        </div>
      ))}
    </div>
  );
}
