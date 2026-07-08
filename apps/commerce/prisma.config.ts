import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 moved CLI connection config here (schema no longer holds `url`).
// Used by `prisma db push`, `migrate`, `studio`, `introspect`.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
