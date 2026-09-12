import { requireEnv } from "@/lib/env";

/**
 * Generic Twilio client factory. Not wired to any DaVinci WhatsApp
 * webhook or send call today — implemented during the hackathon.
 */

export function getTwilioConfig() {
  return {
    accountSid: requireEnv("TWILIO_ACCOUNT_SID"),
    authToken: requireEnv("TWILIO_AUTH_TOKEN"),
    whatsappNumber: requireEnv("TWILIO_WHATSAPP_NUMBER"),
  };
}
