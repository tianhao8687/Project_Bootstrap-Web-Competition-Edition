const value = process.argv[2] ?? process.env.DEPLOYMENT_URL;
if (!value) throw new Error("Pass the deployed origin: pnpm smoke:deployment -- https://your-project.vercel.app");

const base = new URL(value);
if (base.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(base.hostname)) {
  throw new Error("Deployment smoke checks require HTTPS, except for localhost.");
}

const checks = [];
const home = await request("/", { method: "GET" });
assert(home.response.status === 200, `GET / returned ${home.response.status}`);
assert(home.text.includes('<div id="root"></div>'), "GET / did not return the application shell.");
const clientText = [home.text];
for (const match of home.text.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) {
  const assetUrl = new URL(match[1], base);
  if (assetUrl.origin !== base.origin) continue;
  const asset = await request(assetUrl.pathname, { method: "GET" });
  assert(asset.response.status === 200, `Client asset ${assetUrl.pathname} returned ${asset.response.status}.`);
  clientText.push(asset.text);
}
for (const serverOnlyName of ["LLM_API_KEY", "GITHUB_TOKEN"]) {
  assert(!clientText.some((text) => text.includes(serverOnlyName)), `The client bundle exposed the server-only variable name ${serverOnlyName}.`);
}
checks.push("application shell");

for (const path of ["/api/bootstrap", "/api/research"]) {
  const methodGate = await request(path, { method: "GET" });
  assert(methodGate.response.status === 405, `GET ${path} returned ${methodGate.response.status}, expected 405.`);
  const invalid = await request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert(invalid.response.status === 400, `Invalid POST ${path} returned ${invalid.response.status}, expected 400.`);
  const body = JSON.parse(invalid.text);
  assert(body.code === "INVALID_INPUT", `Invalid POST ${path} did not return INVALID_INPUT.`);
  checks.push(`${path} method and input gates`);
}

console.log(`Deployment smoke passed for ${base.origin}: ${checks.join("; ")}.`);

async function request(path, init) {
  const response = await fetch(new URL(path, base), { ...init, redirect: "error", signal: AbortSignal.timeout(10_000) });
  return { response, text: await response.text() };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
