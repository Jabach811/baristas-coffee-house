import { cp, mkdir, rm, copyFile, access } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const client = path.join(dist, "client");
const server = path.join(dist, "server");
const hosting = path.join(dist, ".openai");

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });
await mkdir(hosting, { recursive: true });

for (const file of ["index.html", "menu.html", "styles.css", "script.js", "home.css", "home.js"]) {
  await copyFile(path.join(root, file), path.join(client, file));
}
for (const folder of ["assets", "images"]) {
  await cp(path.join(root, folder), path.join(client, folder), { recursive: true });
}
await copyFile(path.join(root, "src", "worker.js"), path.join(server, "index.js"));
await copyFile(path.join(root, ".openai", "hosting.json"), path.join(hosting, "hosting.json"));

for (const required of [
  "client/index.html",
  "client/menu.html",
  "client/styles.css",
  "client/script.js",
  "server/index.js",
  ".openai/hosting.json"
]) {
  await access(path.join(dist, required));
}

console.log("Barista's Sites bundle built");
