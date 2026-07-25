import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const directory = path.join(process.cwd(), "db", "migrations");
const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
const errors = [];
const prefixes = new Map();
const manifest = [];

for (const name of files) {
  const match = /^(\d{3})_[a-z0-9_]+\.sql$/.exec(name);
  if (!match) {
    errors.push(`${name} must match NNN_lowercase_name.sql.`);
    continue;
  }
  const prefix = match[1];
  const duplicate = prefixes.get(prefix);
  if (duplicate) errors.push(`${name} reuses migration prefix ${prefix} already used by ${duplicate}.`);
  prefixes.set(prefix, name);

  const content = await readFile(path.join(directory, name), "utf8");
  if (!content.trim()) errors.push(`${name} is empty.`);
  if (/\bDROP\s+(TABLE|DATABASE|SCHEMA)\b/i.test(content)) {
    errors.push(`${name} contains a destructive DROP statement and requires an explicit reviewed migration strategy.`);
  }
  manifest.push({
    name,
    checksum: createHash("sha256").update(content).digest("hex"),
    bytes: Buffer.byteLength(content),
  });
}

console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  event: "migration.validation",
  ok: errors.length === 0,
  count: files.length,
  errors,
  manifest,
}, null, 2));

if (errors.length) process.exit(1);
