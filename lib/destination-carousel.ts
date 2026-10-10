export function nextCarouselIndex(current: number, direction: -1 | 1, total: number): number {
  if (total <= 0) return -1;
  const safeCurrent = current >= 0 && current < total ? current : 0;
  return (safeCurrent + direction + total) % total;
}

export function safeDestinationHref(href: string, location: string): string {
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\")) return href;
  return `/villas?location=${encodeURIComponent(location)}&match=exact`;
}
