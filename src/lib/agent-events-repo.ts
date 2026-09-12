import { getSupabaseAdmin } from "@/services/supabase-client";
import { AgentEventStatus } from "@/types/message";
import { logger } from "@/lib/logger";

interface LogEventInput {
  jobId?: string | null;
  eventType: string;
  tool?: string | null;
  status: AgentEventStatus;
  inputSummary?: string | null;
  outputSummary?: string | null;
}

/** Persists a trace event. Never throws — observability must not break the main flow. */
export async function logAgentEvent(input: LogEventInput): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("agent_events").insert({
      job_id: input.jobId ?? null,
      event_type: input.eventType,
      tool: input.tool ?? null,
      status: input.status,
      input_summary: input.inputSummary ?? null,
      output_summary: input.outputSummary ?? null,
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    logger.error("AGENT_EVENT_LOG_FAILED", {
      eventType: input.eventType,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
