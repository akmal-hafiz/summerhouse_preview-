// Read deployed environment only. Never print configured values or make requests.
const checks = new Map();
const origins = (process.env.SESSION_ALLOWED_ORIGINS || "").split(",").map(v => v.trim()).filter(Boolean);
checks.set("Node 22+ runtime", Number(process.versions.node.split(".")[0]) >= 22);
checks.set("Production environment", process.env.NODE_ENV === "production");
checks.set("Exact HTTPS session origins", origins.length > 0 && origins.every(value => {
  try { const url = new URL(value); return url.protocol === "https:" && url.origin === value && !url.username && !url.password; }
  catch { return false; }
}));
checks.set("Server-only CMS endpoint configured", Boolean(process.env.CMS_API_URL));
checks.set("Safe CMS transport", (() => {
  try { const url = new URL(process.env.CMS_API_URL); return !url.username && !url.password && !url.search && !url.hash && (url.protocol === "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)); }
  catch { return false; }
})());
checks.set("Trusted IP header explicitly provisioned", /^[a-z0-9-]+$/i.test(process.env.TRUSTED_CLIENT_IP_HEADER || ""));
checks.set("No public secret environment names", !Object.keys(process.env).some(key => key.startsWith("NEXT_PUBLIC_") && /SECRET|PASSWORD|API_KEY|AUTH_TOKEN/.test(key)));
for (const [label, pass] of checks) console.log(`${pass ? "PASS" : "FAIL"} ${label}`);
console.log("Configuration only. Ingress must strip/overwrite IP headers, restrict origin ports and provide shared/edge rate limits. CSP remains report-only until staging validation.");
if ([...checks.values()].includes(false)) process.exitCode = 1;
