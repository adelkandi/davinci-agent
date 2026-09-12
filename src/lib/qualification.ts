import { Job } from "@/types/job";

/**
 * Code-decided qualification gate — never trusts the model's own claim that a job is ready.
 * A job is ready for a crew to act on once there is a usable description and a service address.
 */
export function isQualified(job: Job): boolean {
  return Boolean(job.description?.trim()) && Boolean(job.address?.trim());
}
