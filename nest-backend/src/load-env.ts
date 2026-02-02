import * as dotenv from "dotenv";
import * as path from "path";

// Load env before any other module (e.g. firebase-admin) reads process.env.
// Run from nest-backend root: .env.local and .env
const root = process.cwd();
dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env") });
