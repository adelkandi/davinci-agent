import { JobStatus } from "@/types/job";

const TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  NEW: ["QUALIFYING", "HUMAN_REQUIRED", "FAILED"],
  QUALIFYING: ["QUALIFIED", "HUMAN_REQUIRED", "FAILED"],
  QUALIFIED: ["WAITING_FOR_CREW", "QUALIFYING", "HUMAN_REQUIRED", "FAILED"],
  WAITING_FOR_CREW: ["ACCEPTED", "DECLINED", "HUMAN_REQUIRED", "FAILED"],
  ACCEPTED: ["CUSTOMER_NOTIFIED", "HUMAN_REQUIRED", "FAILED"],
  CUSTOMER_NOTIFIED: [],
  DECLINED: ["WAITING_FOR_CREW", "HUMAN_REQUIRED"],
  HUMAN_REQUIRED: ["QUALIFYING", "QUALIFIED", "WAITING_FOR_CREW", "FAILED"],
  FAILED: [],
};

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

export class InvalidTransitionError extends Error {
  constructor(from: JobStatus, to: JobStatus) {
    super(`Invalid job transition: ${from} -> ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export function assertTransition(from: JobStatus, to: JobStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}
