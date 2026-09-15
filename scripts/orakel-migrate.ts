/* Migration auf Neon anwenden: ORAKEL_DATABASE_URL=... npm run orakel:migrate */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.ORAKEL_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("ORAKEL_DATABASE_URL fehlt.");
  process.exit(1);
}
migrate(drizzle(neon(url)), { migrationsFolder: "drizzle/orakel" })
  .then(() => console.log("Migration angewendet."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
