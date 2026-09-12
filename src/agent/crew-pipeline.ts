import { logger } from "@/lib/logger";
import { findLatestWaitingForCrewJob } from "@/lib/jobs-repo";
import { insertMessage } from "@/lib/messages-repo";
import { logAgentEvent } from "@/lib/agent-events-repo";
import { sendWhatsAppMessage } from "@/services/twilio-client";
import { assignWorker, notifyCustomer, updateJob } from "@/tools";

export interface InboundCrewMessage {
  from: string;
  body: string;
  messageSid: string;
}

async function sendCrewReply(to: string, text: string): Promise<void> {
  try {
    await sendWhatsAppMessage(to, text);
  } catch (error) {
    logger.error("CREW_REPLY_FAILED", { to, error: error instanceof Error ? error.message : String(error) });
  }
}

export async function handleCrewMessage(ctx: InboundCrewMessage): Promise<void> {
  const command = ctx.body.trim().toUpperCase();
  logger.info("CREW_MESSAGE_RECEIVED", { from: ctx.from, command });

  const job = await findLatestWaitingForCrewJob();

  await insertMessage({
    jobId: job?.id ?? null,
    senderRole: "CREW",
    direction: "inbound",
    messageType: "text",
    content: ctx.body,
    providerMessageSid: ctx.messageSid,
  });

  if (!job) {
    await sendCrewReply(ctx.from, "No job is currently waiting for acceptance.");
    return;
  }

  if (command.startsWith("ACCEPT")) {
    const accepted = await assignWorker(job, ctx.from);
    const result = await notifyCustomer(accepted);
    await sendCrewReply(
      ctx.from,
      result.success
        ? "Job assigned to you. Customer notified."
        : "Job assigned to you, but the customer notification failed — please follow up directly."
    );
    return;
  }

  if (command.startsWith("DECLINE")) {
    await updateJob(job, { status: "DECLINED" });
    logger.info("CREW_DECLINED", { jobId: job.id });
    await logAgentEvent({ jobId: job.id, eventType: "CREW_DECLINED", tool: "assign_worker", status: "success" });
    await sendCrewReply(ctx.from, "Job declined. Flagged for reassignment.");
    return;
  }

  if (command.startsWith("INFO")) {
    await sendCrewReply(ctx.from, job.aiSummary ?? job.description ?? "No additional details available.");
    return;
  }

  await sendCrewReply(ctx.from, "Reply ACCEPT to take the pending job.");
}
