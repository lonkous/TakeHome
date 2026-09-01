import { z } from 'zod';

// Client-safe env. No dotenv, no Node APIs, no Cosmos master key.
// Only public EXPO_PUBLIC_ vars are available in Expo web/native bundles.
// Cosmos vars (AZURE_COSMOS_DB_*) live in src/config/env.server.ts (server-only).

const EnvSchema = z.object({
  EXPO_PUBLIC_AZURE_CLIENT_ID: z.string().optional(),
  EXPO_PUBLIC_AZURE_TENANT_ID: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);

const config = {
  azure: {
    clientId: env.EXPO_PUBLIC_AZURE_CLIENT_ID,
    tenantId: env.EXPO_PUBLIC_AZURE_TENANT_ID,
  },
};

export default config;
