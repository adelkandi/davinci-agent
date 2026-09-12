import { Job } from "@/types/job";

const SERVICE_LABELS: Record<Job["serviceType"], string> = {
  plumbing: "Plumbing",
  hvac: "HVAC",
  electrical: "Electrical",
  repair: "Repair",
  other: "Service",
  unknown: "Service",
};

/** Deterministically built from job state — never trusts the model's own claim of what was sent. */
export function buildCrewNotification(job: Job): string {
  const urgent = job.urgency === "high" || job.urgency === "emergency";
  const header = urgent ? `🚨 ${job.urgency.toUpperCase()} JOB` : "JOB REQUEST";
  const title = `${SERVICE_LABELS[job.serviceType]} — ${job.description ?? "Details pending"}`;
  const location = job.address ?? job.city ?? "Address not yet provided";
  const timing = [job.preferredDate, job.preferredTime].filter(Boolean).join(" ") || "Not specified";

  const evidence: string[] = ["✓ description"];
  if (job.address) evidence.push("✓ address");
  if (job.preferredDate || job.preferredTime) evidence.push("✓ availability");
  if (job.hasPhoto) evidence.push("✓ photo");
  if (job.hasVoice) evidence.push("✓ voice note");

  return [
    header,
    title,
    "",
    `📍 ${location}`,
    `🕐 ${timing}`,
    "",
    "Customer provided:",
    evidence.join("\n"),
    "",
    "DaVinci assessment:",
    job.aiSummary ?? job.description ?? "No summary available.",
    "",
    "Reply ACCEPT to take this job.",
  ].join("\n");
}

export function buildCustomerConfirmation(job: Job): string {
  const known: string[] = ["description"];
  if (job.address) known.push("address");
  if (job.hasPhoto) known.push("photo");
  if (job.hasVoice) known.push("voice note");

  return `Good news — a technician has accepted your request. They already have your ${known.join(", ")}, so you won't need to explain everything again. They'll be in touch about next steps.`;
}
