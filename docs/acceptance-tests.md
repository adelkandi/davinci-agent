# Acceptance Tests

Priority order: P0 before P1. P1 before P2. Do not spend time on P2 until all P0s pass.

## P0 — Critical

- [ ] Customer sends WhatsApp text and webhook receives it
- [ ] DaVinci can reply to customer
- [ ] Customer job state persists
- [ ] Multiple customer messages update same job
- [ ] Voice note can be downloaded
- [ ] Voice can be transcribed
- [ ] Image can be processed
- [ ] Structured job output validates
- [ ] Urgent request gets high urgency
- [ ] Missing information triggers concise follow-up
- [ ] Crew receives actionable notification
- [ ] Crew ACCEPT is recognized
- [ ] Correct job becomes ACCEPTED
- [ ] Customer is notified only after acceptance succeeds
- [ ] No fake action success is reported
- [ ] Full killer demo succeeds end-to-end

## P1 — Important

- [ ] French input works
- [ ] Error logging is understandable
- [ ] Duplicate webhook does not duplicate important actions
- [ ] API failure produces graceful fallback

## P2 — Nice to Have

- [ ] Mission Control
- [ ] Trigger.dev
- [ ] Enhanced UI
- [ ] Extra polish

None of these tests can be executed today — they are prepared here so the hackathon build can be validated against a fixed checklist as each phase completes.
