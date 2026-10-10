import assert from "node:assert/strict";
import { test } from "node:test";
import snapshot from "../data/previewCmsSnapshot.json";

test("visual preview contains public editorial and villa presentation data", () => {
  const responses = snapshot.responses as Record<string, unknown>;
  const articles = responses["/v1/cms/articles"] as { articles: Array<{ slug: string }> };
  const catalog = responses["/v1/cms/lodgify/snapshot"] as {
    properties: Array<{ property: Record<string, unknown> }>;
  };

  assert.ok(articles.articles.length >= 4);
  assert.ok(catalog.properties.length > 0);
  assert.ok(responses["/v1/cms/page/home"]);
  assert.ok(responses["/v1/cms/page/about"]);
  assert.ok(responses["/v1/cms/bali-collections"]);

  for (const article of articles.articles) {
    assert.ok(responses[`/v1/cms/articles/${encodeURIComponent(article.slug)}`]);
  }
});

test("visual preview never includes local CMS URLs or stale prices", () => {
  const serialized = JSON.stringify(snapshot);
  assert.doesNotMatch(serialized, /(?:localhost|127\.0\.0\.1|\/storage\/)/i);

  const catalog = snapshot.responses["/v1/cms/lodgify/snapshot"];
  for (const item of catalog.properties) {
    for (const key of ["min_price", "max_price", "original_min_price", "original_max_price"] as const) {
      assert.equal(key in item.property, false);
    }
  }
});
