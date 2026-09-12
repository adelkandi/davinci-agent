import { logger } from "@/lib/logger";
import { findActiveJobByPhone } from "@/lib/jobs-repo";
import { insertMessage } from "@/lib/messages-repo";
import { logAgentEvent } from "@/lib/agent-events-repo";
import { isQualified } from "@/lib/qualification";
import { downloadTwilioMedia } from "@/services/twilio-client";
import { transcribeAudio, describeImage } from "@/services/openai-client";
import { createJob, updateJob, markUrgent, notifyCrew, sendCustomerReply, requestHumanAction } from "@/tools";
import { runAgent } from "./decide";
import { JobPatch } from "@/lib/jobs-repo";
import { MessageType } from "@/types/message";

export interface InboundWhatsAppMessage {
  from: string;
  body: string;
  numMedia: number;
  mediaUrl: string | null;
  mediaContentType: string | null;
  messageSid: string;
}

export async function handleCustomerMessage(ctx: InboundWhatsAppMessage): Promise<void> {
  let job = await findActiveJobByPhone(ctx.from);
  if (!job) {
    job = await createJob(ctx.from);
  }

  let messageType: MessageType = "text";
  let transcript: string | null = null;
  let imageObservation: string | null = null;
  let isImage = false;
  let isVoice = false;

  const hasMedia = ctx.numMedia > 0 && Boolean(ctx.mediaUrl);
  if (hasMedia && ctx.mediaContentType?.startsWith("image/")) {
    messageType = "image";
    isImage = true;
    logger.info("MEDIA_DETECTED", { jobId: job.id, type: "image" });
    try {
      const { buffer, contentType } = await downloadTwilioMedia(ctx.mediaUrl!);
      imageObservation = await describeImage(buffer, contentType);
      logger.info("IMAGE_ANALYZED", { jobId: job.id });
      await logAgentEvent({ jobId: job.id, eventType: "IMAGE_ANALYZED", status: "success", outputSummary: imageObservation });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("IMAGE_ANALYSIS_FAILED", { jobId: job.id, error: message });
      await logAgentEvent({ jobId: job.id, eventType: "IMAGE_ANALYZED", status: "failure", outputSummary: message });
    }
  } else if (hasMedia && ctx.mediaContentType?.startsWith("audio/")) {
    messageType = "voice";
    isVoice = true;
    logger.info("MEDIA_DETECTED", { jobId: job.id, type: "voice" });
    try {
      const { buffer, contentType } = await downloadTwilioMedia(ctx.mediaUrl!);
      transcript = await transcribeAudio(buffer, contentType);
      logger.info("AUDIO_TRANSCRIBED", { jobId: job.id });
      await logAgentEvent({ jobId: job.id, eventType: "AUDIO_TRANSCRIBED", status: "success", outputSummary: transcript });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("AUDIO_TRANSCRIPTION_FAILED", { jobId: job.id, error: message });
      await logAgentEvent({ jobId: job.id, eventType: "AUDIO_TRANSCRIBED", status: "failure", outputSummary: message });
    }
  }

  const contextParts = [
    ctx.body?.trim() || null,
    transcript ? `[Voice transcript]: ${transcript}` : null,
    imageObservation ? `[Image observation]: ${imageObservation}` : null,
  ].filter((part): part is string => Boolean(part));

  const combinedText = contextParts.join("\n");
  const persistedContent =
    combinedText ||
    (messageType === "voice" ? "[voice note could not be transcribed]" : messageType === "image" ? "[image received]" : "");

  await insertMessage({
    jobId: job.id,
    senderRole: "CUSTOMER",
    direction: "inbound",
    messageType,
    content: persistedContent,
    mediaUrl: ctx.mediaUrl,
    providerMessageSid: ctx.messageSid,
  });

  if (isImage || isVoice) {
    job = await updateJob(job, {
      hasPhoto: isImage || job.hasPhoto,
      hasVoice: isVoice || job.hasVoice,
    });
  }

  if (!combinedText.trim()) {
    await sendCustomerReply(
      job,
      "Sorry, I couldn't process that. Could you type the important details (problem, location, and timing)?"
    );
    return;
  }

  if (job.status === "NEW") {
    job = await updateJob(job, { status: "QUALIFYING" });
  }

  const decision = await runAgent({ job, latestMessageText: combinedText });
  logger.info("AGENT_DECISION_CREATED", { jobId: job.id, nextAction: decision.nextAction, urgency: decision.urgency });
  await logAgentEvent({
    jobId: job.id,
    eventType: "AGENT_DECISION_CREATED",
    status: "success",
    outputSummary: JSON.stringify({ nextAction: decision.nextAction, urgency: decision.urgency }),
  });

  const patch: JobPatch = {
    serviceType: decision.serviceType,
    urgency: decision.urgency,
    description: decision.description || job.description,
    city: decision.city ?? job.city,
    address: decision.address ?? job.address,
    preferredDate: decision.preferredDate ?? job.preferredDate,
    preferredTime: decision.preferredTime ?? job.preferredTime,
    aiSummary: decision.aiSummary || job.aiSummary,
    missingInformation: decision.missingInformation,
    safetyConcern: decision.safetyConcern,
    safetyReason: decision.safetyReason,
  };

  job = await updateJob(job, patch);

  if (decision.safetyConcern && (decision.urgency === "high" || decision.urgency === "emergency")) {
    job = await markUrgent(job, decision.safetyReason ?? "Safety concern detected");
  }

  if (decision.nextAction === "ESCALATE_HUMAN") {
    job = await requestHumanAction(job, decision.safetyReason ?? decision.intent);
    await sendCustomerReply(job, decision.customerResponse);
    return;
  }

  if (job.status === "QUALIFYING" && isQualified(job)) {
    job = await updateJob(job, { status: "QUALIFIED" });
    logger.info("JOB_QUALIFIED", { jobId: job.id });
    await logAgentEvent({ jobId: job.id, eventType: "JOB_QUALIFIED", status: "success" });

    await sendCustomerReply(job, decision.customerResponse);
    await notifyCrew(job);
    return;
  }

  await sendCustomerReply(job, decision.customerResponse);
}
