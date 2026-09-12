# Job State Machine

Status: implemented in `src/lib/state-machine.ts` as a typed transition table, verified end-to-end on real devices. Invalid transitions throw and are never silently allowed.

## Primary Path

```
NEW → QUALIFYING → QUALIFIED → WAITING_FOR_CREW → ACCEPTED → CUSTOMER_NOTIFIED
```

- **NEW** — job created from the first customer message, before enough information exists.
- **QUALIFYING** — DaVinci is actively extracting structured info and may be asking follow-up questions.
- **QUALIFIED** — enough structured information exists (service type, location, urgency, address) to notify a worker.
- **WAITING_FOR_CREW** — a worker has been notified and the job awaits human acceptance.
- **ACCEPTED** — a worker has explicitly accepted the job.
- **CUSTOMER_NOTIFIED** — the customer has been informed of the real, confirmed outcome.

## Additional States

- **URGENT** — a modifier/flag (not necessarily exclusive with the above) indicating the job should be prioritized and escalated faster.
- **HUMAN_REQUIRED** — the situation exceeds what DaVinci should decide alone (e.g. safety risk, ambiguous scope); a human must intervene.
- **DECLINED** — a worker explicitly declined the job; DaVinci should attempt reassignment or escalate.
- **FAILED** — a required step could not complete (e.g. notification failed, transcription failed) and the job cannot proceed automatically.

## Conceptual Transition Rules

- A job can only move forward (NEW → QUALIFYING → QUALIFIED → ...) once the data required for that stage is present and validated — never based on the model's own claim that a step "succeeded."
- URGENT can be applied at any point once urgency is detected; it changes notification priority, not the primary path.
- HUMAN_REQUIRED can interrupt the primary path from any state and must block further automated progress until a human resolves it.
- DECLINED returns a job to WAITING_FOR_CREW (for reassignment) rather than terminating it.
- FAILED is terminal for the automated flow and requires human follow-up.
- CUSTOMER_NOTIFIED only happens after a real, verified action (e.g. crew acceptance) — never based on an unverified model claim.

Implementation matches this document. `URGENT` is represented as the `urgency` field on Job rather than a separate status, per the original design note above.
