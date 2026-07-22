import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum dikonfigurasi");

function pooledNeonUrl(value: string) {
  const url = new URL(value);
  if (
    url.hostname.endsWith(".neon.tech") &&
    !url.hostname.split(".")[0].endsWith("-pooler")
  ) {
    const [endpoint, ...rest] = url.hostname.split(".");
    url.hostname = `${endpoint}-pooler.${rest.join(".")}`;
  }
  return url.toString();
}

// User-facing reads and writes go through Neon's stateless HTTP driver. This
// avoids keeping fragile database sockets open on the VPS and handles compute
// wake-ups more reliably for auth/session and dashboard requests.
const httpClient = neon(connectionString);
export const db = drizzleNeon(httpClient, { schema });

// Multi-step domain workflows still require interactive transactions. Route
// only those operations through Neon's pooler and keep the pool small.
const client = postgres(pooledNeonUrl(connectionString), {
  ssl: "require",
  max: 5,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false,
});

export const transactionalDb = drizzle(client, { schema });
