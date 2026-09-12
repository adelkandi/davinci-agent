import Twilio from "twilio";
import { requireEnv } from "@/lib/env";

let client: ReturnType<typeof Twilio> | null = null;

function getClient(): ReturnType<typeof Twilio> {
  if (!client) {
    client = Twilio(requireEnv("TWILIO_ACCOUNT_SID"), requireEnv("TWILIO_AUTH_TOKEN"));
  }
  return client;
}

function toWhatsApp(phone: string): string {
  return phone.startsWith("whatsapp:") ? phone : `whatsapp:${phone}`;
}

/**
 * Sends a WhatsApp message via the Twilio REST API and returns the confirmed message SID.
 * Throws on failure — callers must not treat the send as successful unless this resolves.
 */
export async function sendWhatsAppMessage(to: string, body: string): Promise<string> {
  const twilioClient = getClient();
  const from = toWhatsApp(requireEnv("TWILIO_WHATSAPP_NUMBER"));
  const message = await twilioClient.messages.create({
    from,
    to: toWhatsApp(to),
    body,
  });
  return message.sid;
}

/** Downloads Twilio-hosted media (voice note / image) using account auth. */
export async function downloadTwilioMedia(mediaUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
  const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
  const authToken = requireEnv("TWILIO_AUTH_TOKEN");
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const response = await fetch(mediaUrl, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    throw new Error(`Twilio media download failed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const arrayBuffer = await response.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType };
}
