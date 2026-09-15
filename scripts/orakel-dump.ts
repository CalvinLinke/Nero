import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { latestSnapshots } from "../src/lib/orakel/run";
latestSnapshots().then((s) => { console.log(JSON.stringify(s, null, 1)); process.exit(0); });
