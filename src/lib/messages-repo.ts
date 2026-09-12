import { getSupabaseAdmin } from "@/services/supabase-client";
import { Message, MessageDirection, MessageType, SenderRole } from "@/types/message";

interface InsertMessageInput {
  jobId: string | null;
  senderRole: SenderRole;
  direction: MessageDirection;
  messageType: MessageType;
  content?: string | null;
  mediaUrl?: string | null;
  providerMessageSid?: string | null;
}

function fromRow(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    jobId: row.job_id as string,
    senderRole: row.sender_role as SenderRole,
    direction: row.direction as MessageDirection,
    messageType: row.message_type as MessageType,
    content: (row.content as string | null) ?? null,
    mediaUrl: (row.media_url as string | null) ?? null,
    providerMessageSid: (row.provider_message_sid as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

/** Returns null if this providerMessageSid was already recorded (duplicate webhook delivery). */
export async function insertMessage(input: InsertMessageInput): Promise<Message | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      job_id: input.jobId,
      sender_role: input.senderRole,
      direction: input.direction,
      message_type: input.messageType,
      content: input.content ?? null,
      media_url: input.mediaUrl ?? null,
      provider_message_sid: input.providerMessageSid ?? null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") return null; // unique violation on provider_message_sid
    throw new Error(`insertMessage failed: ${error.message}`);
  }
  return fromRow(data);
}

export async function providerMessageSidExists(sid: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("messages")
    .select("id")
    .eq("provider_message_sid", sid)
    .maybeSingle();

  if (error) throw new Error(`providerMessageSidExists failed: ${error.message}`);
  return Boolean(data);
}
