# Tool Contracts (Planned)

Status: planning only. No tool is implemented today. This documents the intended contract for each future agent-callable tool so implementation on hackathon day can move fast without redesigning behavior.

## create_job()

- **Purpose:** create a new Job record from the first customer message.
- **Required inputs:** customerPhone, initial message content/type.
- **Expected result:** new Job in state NEW, first Message record linked.
- **Failure behavior:** if persistence fails, surface an error and do not tell the customer a job was created.
- **Human approval required:** no.

## update_job()

- **Purpose:** update structured fields on an existing Job as more information is extracted.
- **Required inputs:** jobId, partial field updates (e.g. serviceType, address, urgency).
- **Expected result:** Job updated, updatedAt bumped, only valid/whitelisted fields changed.
- **Failure behavior:** reject unknown fields; on persistence failure, do not advance job state.
- **Human approval required:** no.

## mark_urgent()

- **Purpose:** flag a job as urgent based on detected signals (e.g. active leak, safety risk).
- **Required inputs:** jobId, reason/signal summary.
- **Expected result:** Job urgency set to high; may trigger higher-priority crew notification.
- **Failure behavior:** if flagging fails, do not silently continue as if normal priority — surface the failure.
- **Human approval required:** no (informational escalation), but see request_human_action() for anything consequential.

## request_human_action()

- **Purpose:** escalate a situation DaVinci should not decide alone (ambiguous safety risk, conflicting information, edge case).
- **Required inputs:** jobId, reason, relevant context summary.
- **Expected result:** Job (or a flag on it) moves toward HUMAN_REQUIRED; a human is alerted.
- **Failure behavior:** if the alert cannot be delivered, this is a critical failure and must be logged loudly, not swallowed.
- **Human approval required:** yes — this tool exists specifically to hand off to a human.

## notify_crew()

- **Purpose:** send a concise, actionable job summary to a field worker.
- **Required inputs:** jobId, worker contact, job summary (service type, location, urgency, description).
- **Expected result:** outbound message sent to the worker; delivery is confirmed via the messaging provider, not assumed.
- **Failure behavior:** if the send fails, the job stays in QUALIFIED (not WAITING_FOR_CREW) and the failure is logged.
- **Human approval required:** no to send the notification, but the resulting job acceptance is a human decision.

## notify_customer()

- **Purpose:** inform the customer of a real, confirmed outcome (e.g. a worker accepted their job).
- **Required inputs:** jobId, customer contact, outcome summary.
- **Expected result:** outbound message sent to the customer; only triggered after the underlying action is verified to have actually succeeded.
- **Failure behavior:** if the send fails, retry/log — never mark the job CUSTOMER_NOTIFIED without confirmed delivery.
- **Human approval required:** no, but it may only fire after a human-driven event (e.g. crew acceptance) has been verified.

## assign_worker()

- **Purpose:** record which worker accepted a job.
- **Required inputs:** jobId, workerId/contact.
- **Expected result:** Job.assignedWorker set, Job state moves to ACCEPTED.
- **Failure behavior:** if two workers appear to accept concurrently, the first verified acceptance wins; do not double-assign.
- **Human approval required:** yes — this tool records a human's (the worker's) decision, it does not make the decision.

## General Rule

No tool may report an external action as successful unless the application code has independently verified that success (e.g. a confirmed provider response), per the project's core engineering principle: the model proposes, the application validates and executes.
