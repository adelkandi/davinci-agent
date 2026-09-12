import { requireEnv } from "@/lib/env";

/**
 * Generic Supabase client factory. Not wired to any DaVinci table
 * or query today — implemented during the hackathon.
 */

export function getSupabaseConfig() {
  return {
    url: requireEnv("SUPABASE_URL"),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}
