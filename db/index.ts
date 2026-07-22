import postgres from "postgres";
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

// The VPS has reliable direct PostgreSQL connectivity, while long-lived Neon
// WebSocket connections can intermittently time out behind the host network.
// Use Neon's transaction pooler and keep the local pool deliberately small.
const client = postgres(pooledNeonUrl(connectionString), {
  ssl: "require",
  max: 5,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false,
});

export const db = drizzle(client, { schema });
