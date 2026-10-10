import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import process from "node:process";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "output", "production-release");
const frontendOutput = join(outputRoot, "frontend");
const backendOutput = join(outputRoot, "backend");
const deploymentOutput = join(outputRoot, "deployment");
const standaloneRoot = join(projectRoot, ".next", "standalone");

function assertInsideProject(path) {
  const relativePath = relative(projectRoot, path);
  if (!relativePath || relativePath.startsWith(`..${sep}`) || relativePath === "..") {
    throw new Error(`Refusing release operation outside the project: ${path}`);
  }
}

for (const required of [join(standaloneRoot, "server.js"), join(projectRoot, ".next", "static"), join(projectRoot, "backend", "vendor", "autoload.php")]) {
  if (!existsSync(required)) throw new Error(`Missing production build input: ${relative(projectRoot, required)}`);
}

const composerInstalledMetadata = readFileSync(join(projectRoot, "backend", "vendor", "composer", "installed.php"), "utf8");
if (!/'dev'\s*=>\s*false/.test(composerInstalledMetadata)) {
  throw new Error("Backend vendor contains development dependencies. Run Composer install with --no-dev before packaging.");
}

assertInsideProject(outputRoot);
rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(frontendOutput, { recursive: true });
mkdirSync(backendOutput, { recursive: true });
mkdirSync(deploymentOutput, { recursive: true });

cpSync(standaloneRoot, frontendOutput, {
  recursive: true,
  filter(source) {
    const name = basename(source);
    return name !== ".env" && !name.startsWith(".env.");
  },
});
cpSync(join(projectRoot, ".next", "static"), join(frontendOutput, ".next", "static"), { recursive: true });
cpSync(join(projectRoot, "public"), join(frontendOutput, "public"), { recursive: true });
mkdirSync(join(frontendOutput, "scripts"), { recursive: true });
cpSync(join(projectRoot, "scripts", "production-preflight.mjs"), join(frontendOutput, "scripts", "production-preflight.mjs"));
cpSync(join(projectRoot, "scripts", "deploy-production-release.sh"), join(deploymentOutput, "deploy-production-release.sh"));

const excludedBackendPaths = new Set([
  ".env",
  ".env.example",
  ".env.production",
  ".phpunit.cache",
  "node_modules",
  "phpunit.xml",
  "tests",
]);

cpSync(join(projectRoot, "backend"), backendOutput, {
  recursive: true,
  filter(source) {
    const backendRoot = join(projectRoot, "backend");
    const path = relative(backendRoot, source).replaceAll("\\", "/");
    if (!path) return true;
    const firstSegment = path.split("/")[0];
    if (excludedBackendPaths.has(path) || excludedBackendPaths.has(firstSegment)) return false;
    if (path === "storage" || path.startsWith("storage/")) return false;
    if (path === "public/storage" || path.startsWith("public/storage/")) return false;
    if (path === "bootstrap/cache" || path.startsWith("bootstrap/cache/")) return false;
    return true;
  },
});

mkdirSync(join(backendOutput, "bootstrap", "cache"), { recursive: true });
writeFileSync(join(backendOutput, "bootstrap", "cache", ".gitignore"), "*\n!.gitignore\n", "utf8");

const manifest = {
  schema: 1,
  repository: process.env.GITHUB_REPOSITORY || "local/summerhouses-next",
  commit: process.env.GITHUB_SHA || "local",
  ref: process.env.GITHUB_REF || "local",
  runId: process.env.GITHUB_RUN_ID || "local",
  builtAt: new Date().toISOString(),
  node: process.version,
  lockfiles: {
    npm: JSON.parse(readFileSync(join(projectRoot, "package-lock.json"), "utf8")).lockfileVersion,
    composer: existsSync(join(projectRoot, "backend", "composer.lock")),
  },
};
writeFileSync(join(outputRoot, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

function assertNoEnvironmentFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      assertNoEnvironmentFiles(path);
      continue;
    }
    if (entry.name === ".env" || entry.name.startsWith(".env.")) {
      throw new Error(`Environment file leaked into release artifact: ${relative(outputRoot, path)}`);
    }
  }
}

assertNoEnvironmentFiles(outputRoot);

console.log(`Release staged at ${relative(projectRoot, outputRoot)}`);
