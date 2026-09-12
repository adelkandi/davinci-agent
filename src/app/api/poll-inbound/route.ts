import { NextResponse } from "next/server";
import { requireEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getTwilioMessagesClient } from "@/services/twilio-client";
import { providerMessageSidExists } from "@/lib/messages-repo";
import { resolveSenderRole, normalizePhone } from "@/lib/roles";
import { handleCustomerMessage } from "@/agent/customer-pipeline";
import { handleCrewMessage } from "@/agent/crew-pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * FALLBACK inbound transport for when the Twilio Sandbox's push webhook cannot be
 * configured (e.g. Console UI access issue). Twilio always records inbound messages
 * as Message resources regardless of webhook config, so we pull them via the REST API
 * and feed them through the exact same handleCustomerMessage/handleCrewMessage pipeline
 * that /api/whatsapp uses. Existing provider_message_sid idempotency makes repeated
 * polling safe. Not a replacement for the real webhook — remove once it's configured.
 */
let lastPolledAt = new Date(Date.now() - 5 * 60 * 1000);

export async function GET(): Promise<NextResponse> {
  const client = getTwilioMessagesClient();
  const whatsappNumber = requireEnv("TWILIO_WHATSAPP_NUMBER");
  const to = whatsappNumber.startsWith("whatsapp:") ? whatsappNumber : `whatsapp:${whatsappNumber}`;

  const since = lastPolledAt;
  lastPolledAt = new Date();

  const messages = await client.messages.list({
    to,
    dateSentAfter: since,
    limit: 50,
  });

  let processed = 0;
  let skipped = 0;

  for (const msg of messages.reverse()) {
    if (await providerMessageSidExists(msg.sid)) {
      skipped++;
      continue;
    }

    const from = normalizePhone(msg.from);
    let numMedia = Number(msg.numMedia ?? "0");
    let body = msg.body;

    // Twilio can briefly report numMedia=0 on a media message before it finishes
    // attaching media metadata (race between the message record and the media
    // sub-resource). An empty body + zero media on a very fresh message is the
    // signature of that race, not a genuinely empty message — re-fetch once to confirm.
    if (numMedia === 0 && !body) {
      await new Promise((r) => setTimeout(r, 1500));
      const refetched = await client.messages(msg.sid).fetch();
      numMedia = Number(refetched.numMedia ?? "0");
      body = refetched.body;
    }

    let mediaUrl: string | null = null;
    let mediaContentType: string | null = null;

    if (numMedia > 0) {
      try {
        const mediaList = await client.messages(msg.sid).media.list({ limit: 1 });
        if (mediaList[0]) {
          mediaUrl = `https://api.twilio.com${mediaList[0].uri.replace(/\.json$/, "")}`;
          mediaContentType = mediaList[0].contentType;
        }
      } catch (error) {
        logger.error("POLL_INBOUND_MEDIA_LOOKUP_FAILED", {
          sid: msg.sid,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const role = resolveSenderRole(from);
    logger.info("WHATSAPP_MESSAGE_RECEIVED", { from, hasBody: Boolean(body), numMedia, messageSid: msg.sid, via: "poll" });

    try {
      if (role === "CREW") {
        await handleCrewMessage({ from, body: body ?? "", messageSid: msg.sid });
      } else {
        await handleCustomerMessage({
          from,
          body: body ?? "",
          numMedia,
          mediaUrl,
          mediaContentType,
          messageSid: msg.sid,
        });
      }
      processed++;
    } catch (error) {
      logger.error("POLL_INBOUND_PROCESSING_FAILED", {
        sid: msg.sid,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json({ found: messages.length, processed, skipped });
}
