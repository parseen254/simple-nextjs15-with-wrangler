import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/schema/schema.ts",
    out: "./src/db/migrations",
    driver: "d1-http",
    dialect: "sqlite",
    verbose: true,
    strict: true,
    breakpoints: true,
    migrations: {
        prefix: "timestamp",
        table: "migrations",
    },
} satisfies Config);
