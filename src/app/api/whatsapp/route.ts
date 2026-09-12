import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { providerMessageSidExists } from "@/lib/messages-repo";
import { resolveSenderRole, normalizePhone } from "@/lib/roles";
import { handleCustomerMessage } from "@/agent/customer-pipeline";
import { handleCrewMessage } from "@/agent/crew-pipeline";

export const runtime = "nodejs";

const EMPTY_TWIML = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

function twimlResponse(): NextResponse {
  return new NextResponse(EMPTY_TWIML, { status: 200, headers: { "Content-Type": "text/xml" } });
}

/**
 * Twilio WhatsApp inbound webhook. Always replies via the REST API (see src/tools)
 * so every outbound send is independently verified; this handler only acknowledges
 * receipt to Twilio with an empty TwiML response.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    logger.error("WHATSAPP_WEBHOOK_PARSE_FAILED", { error: error instanceof Error ? error.message : String(error) });
    return twimlResponse();
  }

  const from = normalizePhone(String(form.get("From") ?? ""));
  const body = String(form.get("Body") ?? "");
  const messageSid = String(form.get("MessageSid") ?? form.get("SmsMessageSid") ?? "");
  const numMedia = Number(form.get("NumMedia") ?? "0");
  const mediaUrl = numMedia > 0 ? String(form.get("MediaUrl0") ?? "") || null : null;
  const mediaContentType = numMedia > 0 ? String(form.get("MediaContentType0") ?? "") || null : null;

  logger.info("WHATSAPP_MESSAGE_RECEIVED", { from, hasBody: Boolean(body), numMedia, messageSid });

  if (!from || !messageSid) {
    logger.error("WHATSAPP_WEBHOOK_MISSING_FIELDS", { from, messageSid });
    return twimlResponse();
  }

  try {
    if (await providerMessageSidExists(messageSid)) {
      logger.info("WHATSAPP_DUPLICATE_MESSAGE_SKIPPED", { messageSid });
      return twimlResponse();
    }
  } catch (error) {
    logger.error("IDEMPOTENCY_CHECK_FAILED", { error: error instanceof Error ? error.message : String(error) });
  }

  const role = resolveSenderRole(from);

  try {
    if (role === "CREW") {
      await handleCrewMessage({ from, body, messageSid });
    } else {
      await handleCustomerMessage({ from, body, numMedia, mediaUrl, mediaContentType, messageSid });
    }
  } catch (error) {
    logger.error("WHATSAPP_WEBHOOK_PROCESSING_FAILED", {
      from,
      messageSid,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return twimlResponse();
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: "ok", service: "davinci-whatsapp-webhook" });
}
