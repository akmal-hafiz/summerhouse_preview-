/** Applies the price bounds to a villas search query. A bound that is empty, zero or invalid is omitted, meaning "no price filter". */
export function setPriceParams(params: URLSearchParams, minPrice: string | number | undefined, maxPrice: string | number | undefined) {
  for (const [key, raw] of [["minPrice", minPrice], ["maxPrice", maxPrice]] as const) {
    const value = Math.floor(Number(raw));
    if (Number.isFinite(value) && value > 0) params.set(key, String(value));
  }
  return params;
}
