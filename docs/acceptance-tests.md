# Acceptance Tests

Priority order: P0 before P1. P1 before P2. Do not spend time on P2 until all P0s pass.

## P0 — Critical

- [x] Customer sends WhatsApp text and webhook receives it (real message → real inbound transport, see architecture.md)
- [x] DaVinci can reply to customer (real Twilio send, confirmed delivered/read)
- [x] Customer job state persists (Supabase, verified read/write/delete)
- [x] Multiple customer messages update same job (verified across text/voice/image in one job)
- [x] Voice note can be downloaded
- [x] Voice can be transcribed
- [x] Image can be processed
- [x] Structured job output validates (Zod, with retry + safe fallback on failure)
- [x] Urgent request gets high urgency
- [x] Missing information triggers concise follow-up
- [x] Crew receives actionable notification (confirmed read on physical phone)
- [x] Crew ACCEPT is recognized
- [x] Correct job becomes ACCEPTED
- [x] Customer is notified only after acceptance succeeds
- [x] No fake action success is reported (state transitions gated on confirmed Twilio/Supabase success throughout)
- [x] Full killer demo succeeds end-to-end (3/3 real runs)

## P1 — Important

- [ ] French input works (not explicitly tested this build)
- [x] Error logging is understandable (structured JSON logs throughout)
- [x] Duplicate webhook does not duplicate important actions (`provider_message_sid` unique constraint + pre-check)
- [x] API failure produces graceful fallback (verified live: OpenAI billing failure, Twilio config failures, audio format failure — all logged, none crashed, none faked success)

## P2 — Nice to Have

- [x] Mission Control (jobs + recent agent_events, read-only)
- [ ] Trigger.dev (not used — core flow works synchronously without it)
- [ ] Enhanced UI
- [ ] Extra polish
