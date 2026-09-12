# Data Model (Planned)

Status: planning only. No Supabase migration exists yet — this documents the intended shape only.

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

- Field names and types are subject to refinement once the hackathon build begins.
- No SQL migration will be generated until implementation starts (see [build-plan.md](build-plan.md)).
