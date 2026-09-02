import { z } from "zod";

// Server-only env. Never import this from client components (dashboard, etc.).
// Loads .env via dotenv only when running in Node (API routes, scripts).
// Guarded to avoid `process.cwd is not a function` in Expo web bundle.
if (typeof process !== "undefined" && typeof process.cwd === "function") {
  try {
    // dynamic import avoids bundling dotenv into client
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("dotenv").config();
  } catch {
    // ignore if dotenv not available in bundle
  }
}

const EnvSchema = z.object({
  AZURE_COSMOS_DB_ENDPOINT: z.string({
    error: "AZURE_COSMOS_DB_ENDPOINT is required",
  }),
  AZURE_COSMOS_DB_KEY: z.string({
    error: "AZURE_COSMOS_DB_KEY is required",
  }),
  AZURE_COSMOS_DB_DATABASE_NAME: z.string({
    error: "AZURE_COSMOS_DB DB Name is required",
  }),
});

// Do not throw at import time when Metro evaluates this file for the web bundle
// (web process.env only has EXPO_PUBLIC_ vars). Validate lazily on server.
let _env: z.infer<typeof EnvSchema> | null = null;
function getEnv(): z.infer<typeof EnvSchema> {
  if (_env) return _env;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // In web bundle evaluation, return dummy to avoid nullthrows; real error will surface in API handler
    if (typeof window !== "undefined" || process.env.EXPO_OS === "web") {
      _env = {
        AZURE_COSMOS_DB_ENDPOINT: process.env.AZURE_COSMOS_DB_ENDPOINT ?? "",
        AZURE_COSMOS_DB_KEY: process.env.AZURE_COSMOS_DB_KEY ?? "",
        AZURE_COSMOS_DB_DATABASE_NAME:
          process.env.AZURE_COSMOS_DB_DATABASE_NAME ?? "",
      } as z.infer<typeof EnvSchema>;
      return _env;
    }
    throw new Error(parsed.error.message);
  }
  _env = parsed.data;
  return _env;
}

export const env = new Proxy({} as z.infer<typeof EnvSchema>, {
  get(_t, p) {
    return (getEnv() as any)[p];
  },
});

const config = new Proxy(
  {} as {
    cosmos: {
      endpoint: string;
      key: string;
      database: string;
      containers: { datas: string };
    };
  },
  {
    get(_t, p) {
      const e = getEnv();
      if (p === "cosmos") {
        return {
          endpoint: e.AZURE_COSMOS_DB_ENDPOINT,
          key: e.AZURE_COSMOS_DB_KEY,
          database: e.AZURE_COSMOS_DB_DATABASE_NAME,
          containers: { datas: "TakeHomeC" },
        };
      }
      return undefined;
    },
  },
);

export default config;
