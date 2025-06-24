import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;
// console.log("process.env.DATABASE_URL", process.env.DATABASE_URL)
// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?",
//   );
// }

export const pool = new Pool({ connectionString: "postgresql://loansphere_owner:npg_c6MqObgKTl1B@ep-floral-dust-a8sejxje-pooler.eastus2.azure.neon.tech/loansphere?sslmode=require"});
export const db = drizzle({ client: pool, schema });