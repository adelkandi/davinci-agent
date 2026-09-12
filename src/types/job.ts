import { z } from "zod";

export const SERVICE_TYPES = ["plumbing", "hvac", "electrical", "repair", "other", "unknown"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const URGENCY_LEVELS = ["low", "normal", "high", "emergency"] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

export const JOB_STATUSES = [
  "NEW",
  "QUALIFYING",
  "QUALIFIED",
  "WAITING_FOR_CREW",
  "ACCEPTED",
  "CUSTOMER_NOTIFIED",
  "HUMAN_REQUIRED",
  "DECLINED",
  "FAILED",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export interface Job {
  id: string;
  customerPhone: string;
  customerName: string | null;
  serviceType: ServiceType;
  description: string | null;
  city: string | null;
  address: string | null;
  urgency: Urgency;
  preferredDate: string | null;
  preferredTime: string | null;
  aiSummary: string | null;
  assignedWorker: string | null;
  status: JobStatus;
  missingInformation: string[];
  safetyConcern: boolean;
  safetyReason: string | null;
  hasPhoto: boolean;
  hasVoice: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Row shape as stored in Supabase (snake_case). */
export const jobRowSchema = z.object({
  id: z.string(),
  customer_phone: z.string(),
  customer_name: z.string().nullable(),
  service_type: z.enum(SERVICE_TYPES),
  description: z.string().nullable(),
  city: z.string().nullable(),
  address: z.string().nullable(),
  urgency: z.enum(URGENCY_LEVELS),
  preferred_date: z.string().nullable(),
  preferred_time: z.string().nullable(),
  ai_summary: z.string().nullable(),
  assigned_worker: z.string().nullable(),
  status: z.enum(JOB_STATUSES),
  missing_information: z.array(z.string()),
  safety_concern: z.boolean(),
  safety_reason: z.string().nullable(),
  has_photo: z.boolean(),
  has_voice: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type JobRow = z.infer<typeof jobRowSchema>;

export function jobFromRow(row: JobRow): Job {
  return {
    id: row.id,
    customerPhone: row.customer_phone,
    customerName: row.customer_name,
    serviceType: row.service_type,
    description: row.description,
    city: row.city,
    address: row.address,
    urgency: row.urgency,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    aiSummary: row.ai_summary,
    assignedWorker: row.assigned_worker,
    status: row.status,
    missingInformation: row.missing_information,
    safetyConcern: row.safety_concern,
    safetyReason: row.safety_reason,
    hasPhoto: row.has_photo,
    hasVoice: row.has_voice,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
