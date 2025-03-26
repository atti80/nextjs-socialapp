import { drizzle } from "drizzle-orm/neon-serverless";
import { config } from "dotenv";
import * as schema from "./schema";

config({ path: ".env" });

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  schema: schema,
});

console.log("connected to db...");
