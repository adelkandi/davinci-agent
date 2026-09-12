import { getSupabaseAdmin } from "@/services/supabase-client";
import { Job, jobFromRow, jobRowSchema, JobStatus, ServiceType, Urgency } from "@/types/job";

const TERMINAL_STATUSES: JobStatus[] = ["CUSTOMER_NOTIFIED", "FAILED", "DECLINED"];

export async function findActiveJobByPhone(customerPhone: string): Promise<Job | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("customer_phone", customerPhone)
    .not("status", "in", `(${TERMINAL_STATUSES.join(",")})`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`findActiveJobByPhone failed: ${error.message}`);
  if (!data) return null;
  return jobFromRow(jobRowSchema.parse(data));
}

export async function createJobRow(customerPhone: string): Promise<Job> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("jobs")
    .insert({ customer_phone: customerPhone, status: "NEW" })
    .select("*")
    .single();

  if (error) throw new Error(`createJobRow failed: ${error.message}`);
  return jobFromRow(jobRowSchema.parse(data));
}

export interface JobPatch {
  customerName?: string | null;
  serviceType?: ServiceType;
  description?: string | null;
  city?: string | null;
  address?: string | null;
  urgency?: Urgency;
  preferredDate?: string | null;
  preferredTime?: string | null;
  aiSummary?: string | null;
  assignedWorker?: string | null;
  status?: JobStatus;
  missingInformation?: string[];
  safetyConcern?: boolean;
  safetyReason?: string | null;
  hasPhoto?: boolean;
  hasVoice?: boolean;
}

const FIELD_MAP: Record<keyof JobPatch, string> = {
  customerName: "customer_name",
  serviceType: "service_type",
  description: "description",
  city: "city",
  address: "address",
  urgency: "urgency",
  preferredDate: "preferred_date",
  preferredTime: "preferred_time",
  aiSummary: "ai_summary",
  assignedWorker: "assigned_worker",
  status: "status",
  missingInformation: "missing_information",
  safetyConcern: "safety_concern",
  safetyReason: "safety_reason",
  hasPhoto: "has_photo",
  hasVoice: "has_voice",
};

export async function updateJobRow(jobId: string, patch: JobPatch): Promise<Job> {
  const supabase = getSupabaseAdmin();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(patch)) {
    row[FIELD_MAP[key as keyof JobPatch]] = value;
  }

  const { data, error } = await supabase.from("jobs").update(row).eq("id", jobId).select("*").single();

  if (error) throw new Error(`updateJobRow failed: ${error.message}`);
  return jobFromRow(jobRowSchema.parse(data));
}

export async function findLatestWaitingForCrewJob(): Promise<Job | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "WAITING_FOR_CREW")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`findLatestWaitingForCrewJob failed: ${error.message}`);
  if (!data) return null;
  return jobFromRow(jobRowSchema.parse(data));
}
