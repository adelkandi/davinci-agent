import { optionalEnv } from "@/lib/env";

function normalizePhone(phone: string): string {
  return phone.replace(/^whatsapp:/i, "").trim();
}

/**
 * Deterministic role resolution: the configured crew number is CREW,
 * everything else is treated as a CUSTOMER. Never inferred from message content.
 */
export function resolveSenderRole(rawFromPhone: string): "CUSTOMER" | "CREW" {
  const crewPhone = normalizePhone(optionalEnv("CREW_DEMO_PHONE"));
  const from = normalizePhone(rawFromPhone);
  if (crewPhone && from === crewPhone) return "CREW";
  return "CUSTOMER";
}

export { normalizePhone };
