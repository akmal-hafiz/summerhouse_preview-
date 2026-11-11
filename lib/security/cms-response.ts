function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export async function readValidatedCmsResponse(response: Response, path: string): Promise<unknown> {
  if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
    throw new Error("CMS response is unavailable or invalid");
  }
  const value: unknown = await response.json();
  if (!record(value) || value.success !== true) throw new Error("CMS response is invalid");
  if (path === "/v1/cms/lodgify/snapshot") {
    if (!Array.isArray(value.properties) || !value.properties.every(item => record(item) && record(item.property) &&
      ["string", "number"].includes(typeof item.property.id) && Array.isArray(item.rooms) && item.rooms.every(record))) {
      throw new Error("CMS property snapshot schema is invalid");
    }
  }
  return value;
}
