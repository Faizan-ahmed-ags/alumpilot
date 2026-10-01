import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import { join } from "path";
import type { Db } from "./types";
import { buildSeedDb } from "./seed-data";

/**
 * Persistence adapter.
 *
 * MVP uses a single-file JSON store so the product "works immediately
 * after launch" with zero external services. The shape mirrors the
 * relational schema in database/schema.sql; swapping to PostgreSQL /
 * Supabase means replacing this adapter only (see docs/02-architecture.md).
 *
 * Reads are served from an in-memory cache; writes are synchronous and
 * atomic (temp file + rename) which is safe for a single-process demo.
 */

export const STORE_PATH = join(process.cwd(), "database", "store.json");

let cached: Db | null = null;

export function getStore(): Db {
  if (cached) return cached;
  if (existsSync(STORE_PATH)) {
    try {
      const raw = readFileSync(STORE_PATH, "utf8");
      cached = JSON.parse(raw) as Db;
      return cached;
    } catch {
      // corrupted store -> reseed
    }
  }
  cached = buildSeedDb();
  persist();
  return cached;
}

export function persist(): void {
  if (!cached) return;
  mkdirSync(join(process.cwd(), "database"), { recursive: true });
  const tmp = `${STORE_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(cached, null, 2), "utf8");
  renameSync(tmp, STORE_PATH);
}

/** Reset the store to a freshly seeded state (admin utility / tests). */
export function reseed(): Db {
  cached = buildSeedDb();
  persist();
  return cached;
}

/** Clear in-memory cache (used in tests). */
export function __resetCache(): void {
  cached = null;
}