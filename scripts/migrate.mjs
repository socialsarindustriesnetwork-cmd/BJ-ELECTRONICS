import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const migrationsDirectory = path.join(process.cwd(), "db", "migrations");
const migrationLockName = "bj-electronics-schema-migrations-v1";
const statementTimeoutMs = Number(process.env.DB_MIGRATION_STATEMENT_TIMEOUT_MS ?? 120_000);
const lockTimeoutMs = Number(process.env.DB_MIGRATION_LOCK_TIMEOUT_MS ?? 30_000);

function log(event, data = {}) {
  console.info(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: "bj-electronics-migrations",
    event,
    ...data,
  }));
}

function checksum(content) {
  return createHash("sha256").update(content).digest("hex");
}

const client = new Client({
  connectionString: databaseUrl,
  application_name: "bj-electronics-migrations",
  ssl:
    process.env.DB_SSL === "false"
      ? false
      : process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
        : undefined,
});

await client.connect();
let advisoryLockHeld = false;
try {
  await client.query(`SET statement_timeout = '${statementTimeoutMs}ms'`);
  await client.query(`SET lock_timeout = '${lockTimeoutMs}ms'`);
  await client.query("SELECT pg_advisory_lock(hashtext($1))", [migrationLockName]);
  advisoryLockHeld = true;

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      checksum TEXT,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await client.query("ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum TEXT");

  const files = (await readdir(migrationsDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  log("migration.start", { count: files.length });
  for (const name of files) {
    const sql = await readFile(path.join(migrationsDirectory, name), "utf8");
    const fileChecksum = checksum(sql);
    const applied = await client.query(
      "SELECT checksum FROM schema_migrations WHERE name = $1",
      [name],
    );

    if (applied.rowCount) {
      const storedChecksum = applied.rows[0]?.checksum;
      if (storedChecksum && storedChecksum !== fileChecksum) {
        throw new Error(
          `Applied migration ${name} was modified. Expected checksum ${storedChecksum}, received ${fileChecksum}.`,
        );
      }
      if (!storedChecksum) {
        await client.query("UPDATE schema_migrations SET checksum = $2 WHERE name = $1", [name, fileChecksum]);
      }
      log("migration.skipped", { name, checksum: fileChecksum });
      continue;
    }

    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)",
        [name, fileChecksum],
      );
      await client.query("COMMIT");
      log("migration.applied", { name, checksum: fileChecksum });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
  log("migration.complete", { count: files.length });
} catch (error) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: "bj-electronics-migrations",
    event: "migration.failed",
    error: error instanceof Error ? error.message : String(error),
  }));
  process.exitCode = 1;
} finally {
  if (advisoryLockHeld) {
    await client.query("SELECT pg_advisory_unlock(hashtext($1))", [migrationLockName]).catch(() => undefined);
  }
  await client.end();
}
