// Integration runner. Changes only a temporary extension copy and profile.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, cp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = await mkdtemp(join(tmpdir(), "tab-router-test-"));
let process;
let timer;
const server = createServer();
try {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const endpoint = `http://127.0.0.1:${server.address().port}/result`;
  const result = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error("Firefox integration test timed out")), 60000);
    server.on("request", (request, response) => {
      if (request.method !== "POST" || request.url !== "/result") { response.writeHead(404).end(); return; }
      let body = "";
      request.on("data", chunk => { body += chunk; });
      request.on("end", () => {
        try { const value = JSON.parse(body); response.end("ok"); resolve(value); }
        catch (error) { response.writeHead(400).end(); reject(error); }
      });
    });
  });
  await cp("extension", directory, { recursive: true });
  const manifest = JSON.parse(await readFile(join(directory, "manifest.json"), "utf8"));
  manifest.host_permissions = ["http://127.0.0.1/*"];
  manifest.content_security_policy.extension_pages =
    manifest.content_security_policy.extension_pages.replace("connect-src 'none'", "connect-src http://127.0.0.1:*");
  manifest.background.scripts = ["integration.js"];
  await writeFile(join(directory, "manifest.json"), JSON.stringify(manifest));
  const harness = await readFile("test/firefox-harness.js.txt", "utf8");
  await writeFile(join(directory, "integration.js"), harness.replaceAll("__ENDPOINT__", JSON.stringify(endpoint)));
  const args = ["node_modules/web-ext/bin/web-ext.js", "run", "--source-dir", directory,
    "--no-reload", "--args=-headless"];
  if (globalThis.process.env.FIREFOX_BINARY) args.push("--firefox", globalThis.process.env.FIREFOX_BINARY);
  process = spawn(globalThis.process.execPath, args, { stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  process.stdout.on("data", data => { output += data; });
  process.stderr.on("data", data => { output += data; });
  const report = await result;
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) throw new Error(report.error);
} finally {
  clearTimeout(timer);
  if (process) {
    const exited = new Promise(resolve => process.once("exit", resolve));
    process.kill("SIGINT");
    await exited;
  }
  server.close();
  await rm(directory, { recursive: true, force: true });
}
