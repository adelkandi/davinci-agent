import { createJobRow, updateJobRow, JobPatch } from "@/lib/jobs-repo";
import { insertMessage } from "@/lib/messages-repo";
import { logAgentEvent } from "@/lib/agent-events-repo";
import { assertTransition } from "@/lib/state-machine";
import { sendWhatsAppMessage } from "@/services/twilio-client";
import { logger } from "@/lib/logger";
import { requireEnv } from "@/lib/env";
import { Job } from "@/types/job";
import { buildCrewNotification, buildCustomerConfirmation } from "./message-templates";

export async function createJob(customerPhone: string): Promise<Job> {
  const job = await createJobRow(customerPhone);
  logger.info("JOB_CREATED", { jobId: job.id, customerPhone });
  await logAgentEvent({ jobId: job.id, eventType: "JOB_CREATED", tool: "create_job", status: "success", outputSummary: `phone=${customerPhone}` });
  return job;
}

export async function updateJob(job: Job, patch: JobPatch): Promise<Job> {
  if (patch.status && patch.status !== job.status) {
    assertTransition(job.status, patch.status);
  }
  const updated = await updateJobRow(job.id, patch);
  logger.info("JOB_UPDATED", { jobId: job.id, patch: Object.keys(patch) });
  await logAgentEvent({
    jobId: job.id,
    eventType: patch.status && patch.status !== job.status ? "JOB_STATE_TRANSITION" : "JOB_UPDATED",
    tool: "update_job",
    status: "success",
    inputSummary: JSON.stringify(patch),
  });
  return updated;
}

export async function markUrgent(job: Job, reason: string): Promise<Job> {
  if (job.urgency === "high" || job.urgency === "emergency") return job;
  const updated = await updateJob(job, { urgency: "high" });
  await logAgentEvent({ jobId: job.id, eventType: "JOB_MARKED_URGENT", tool: "mark_urgent", status: "success", inputSummary: reason });
  return updated;
}

/** Sends the crew notification and, only on confirmed send, transitions the job to WAITING_FOR_CREW. */
export async function notifyCrew(job: Job): Promise<{ success: boolean; job: Job }> {
  const crewPhone = requireEnv("CREW_DEMO_PHONE");
  const body = buildCrewNotification(job);

  try {
    const sid = await sendWhatsAppMessage(crewPhone, body);
    await insertMessage({ jobId: job.id, senderRole: "SYSTEM", direction: "outbound", messageType: "text", content: body, providerMessageSid: sid });
    const updated = await updateJob(job, { status: "WAITING_FOR_CREW" });
    logger.info("CREW_NOTIFICATION_SENT", { jobId: job.id, sid });
    await logAgentEvent({ jobId: job.id, eventType: "CREW_NOTIFICATION_SENT", tool: "notify_crew", status: "success", outputSummary: sid });
    return { success: true, job: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("CREW_NOTIFICATION_FAILED", { jobId: job.id, error: message });
    await logAgentEvent({ jobId: job.id, eventType: "CREW_NOTIFICATION_SENT", tool: "notify_crew", status: "failure", outputSummary: message });
    return { success: false, job };
  }
}

/** Records a human (worker) decision — does not make the decision itself. */
export async function assignWorker(job: Job, workerPhone: string): Promise<Job> {
  const updated = await updateJob(job, { assignedWorker: workerPhone, status: "ACCEPTED" });
  logger.info("CREW_ACCEPTED", { jobId: job.id, workerPhone });
  await logAgentEvent({ jobId: job.id, eventType: "CREW_ACCEPTED", tool: "assign_worker", status: "success", outputSummary: workerPhone });
  return updated;
}

/** Sends the customer confirmation and, only on confirmed send, transitions the job to CUSTOMER_NOTIFIED. */
export async function notifyCustomer(job: Job, text?: string): Promise<{ success: boolean; job: Job }> {
  const body = text ?? buildCustomerConfirmation(job);

  try {
    const sid = await sendWhatsAppMessage(job.customerPhone, body);
    await insertMessage({ jobId: job.id, senderRole: "SYSTEM", direction: "outbound", messageType: "text", content: body, providerMessageSid: sid });
    const updated = await updateJob(job, { status: "CUSTOMER_NOTIFIED" });
    logger.info("CUSTOMER_NOTIFICATION_SENT", { jobId: job.id, sid });
    await logAgentEvent({ jobId: job.id, eventType: "CUSTOMER_NOTIFICATION_SENT", tool: "notify_customer", status: "success", outputSummary: sid });
    return { success: true, job: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("CUSTOMER_NOTIFICATION_FAILED", { jobId: job.id, error: message });
    await logAgentEvent({ jobId: job.id, eventType: "CUSTOMER_NOTIFICATION_SENT", tool: "notify_customer", status: "failure", outputSummary: message });
    return { success: false, job }; // job stays ACCEPTED, not CUSTOMER_NOTIFIED
  }
}

export async function requestHumanAction(job: Job, reason: string): Promise<Job> {
  const updated = await updateJob(job, { status: "HUMAN_REQUIRED" });
  logger.warn("HUMAN_REQUIRED", { jobId: job.id, reason });
  await logAgentEvent({ jobId: job.id, eventType: "HUMAN_REQUIRED", tool: "request_human_action", status: "success", outputSummary: reason });
  return updated;
}

/** Simple text-only reply during the customer qualification conversation (not a state-changing tool). */
export async function sendCustomerReply(job: Job, text: string): Promise<boolean> {
  try {
    const sid = await sendWhatsAppMessage(job.customerPhone, text);
    await insertMessage({ jobId: job.id, senderRole: "SYSTEM", direction: "outbound", messageType: "text", content: text, providerMessageSid: sid });
    await logAgentEvent({ jobId: job.id, eventType: "CUSTOMER_REPLY_SENT", status: "success", outputSummary: sid });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("CUSTOMER_REPLY_FAILED", { jobId: job.id, error: message });
    await logAgentEvent({ jobId: job.id, eventType: "CUSTOMER_REPLY_SENT", status: "failure", outputSummary: message });
    return false;
  }
}
