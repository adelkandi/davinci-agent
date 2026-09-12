# Data Model

Status: implemented. See `supabase/migrations/0001_init.sql` for the actual schema (matches this document, plus `has_photo`/`has_voice` booleans on Job and a `provider_message_sid` unique constraint on Message for idempotency).

## Job

| Field | Notes |
|---|---|
| id | primary key |
| customerPhone | E.164 phone number |
| customerName | optional, may be learned over the conversation |
| serviceType | plumbing / HVAC / electrical / emergency / other |
| description | free text, may be AI-summarized from multimodal input |
| city | |
| address | exact service address; often the missing field the agent must ask for |
| urgency | e.g. low / normal / high |
| preferredDate | |
| preferredTime | |
| aiSummary | model-generated summary of the job for the crew |
| assignedWorker | reference to the worker who accepted the job |
| status | see [state-machine.md](state-machine.md) |
| createdAt | |
| updatedAt | |

## Message

| Field | Notes |
|---|---|
| id | primary key |
| jobId | foreign key to Job |
| senderRole | CUSTOMER / CREW / SYSTEM |
| direction | inbound / outbound |
| messageType | text / voice / image / location |
| content | text content or transcription |
| mediaUrl | reference to original media, if any |
| createdAt | |

## AgentEvent

| Field | Notes |
|---|---|
| id | primary key |
| jobId | foreign key to Job |
| eventType | e.g. tool_call, state_transition, error |
| tool | name of the tool invoked, if applicable |
| status | success / failure / pending |
| inputSummary | short summary of tool input, for audit/debug |
| outputSummary | short summary of tool output, for audit/debug |
| createdAt | |

## Notes

- Implementation matches this document field-for-field (see `src/types/job.ts`, `src/types/message.ts`).
