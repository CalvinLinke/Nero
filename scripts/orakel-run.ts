/* Lokaler Testlauf: npm run orakel:run  (ohne DATABASE_URL läuft PGlite unter .orakel-db/) */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { runOrakel } from "../src/lib/orakel/run";

runOrakel("manual")
  .then((r) => {
    console.log(JSON.stringify({ ...r, pegel: r.pegel }, null, 2));
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
