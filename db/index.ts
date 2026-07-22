import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum dikonfigurasi");

// The VPS has reliable direct PostgreSQL connectivity, while long-lived Neon
// WebSocket connections can intermittently time out behind the host network.
// Keep the pool deliberately small so it also stays within Neon's free tier.
const client = postgres(connectionString, {
  ssl: "require",
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client, { schema });
