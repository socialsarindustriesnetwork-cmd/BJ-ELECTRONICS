import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { gunzipSync } from "node:zlib";

const names = (await readdir(".bootstrap"))
  .filter((name) => name.startsWith("project.payload.part"))
  .sort();

if (names.length === 0) {
  throw new Error("No project payload files were found.");
}

const payload = (
  await Promise.all(names.map((name) => readFile(join(".bootstrap", name), "utf8")))
).join("");

const files = JSON.parse(
  gunzipSync(Buffer.from(payload, "base64")).toString("utf8"),
);

for (const file of files) {
  await mkdir(dirname(file.path), { recursive: true });
  await writeFile(file.path, file.content);
}

console.log(`Materialized ${files.length} BJ Electronics project files.`);
