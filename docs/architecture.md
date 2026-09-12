# Architecture

Status: implemented and verified end-to-end on real physical devices (real Twilio, OpenAI, Supabase).

## High-Level Flow

```
CUSTOMER
  |
WhatsApp
  |
Twilio WhatsApp Sandbox
  |
Next.js webhook
  |
Media normalization
  |
OpenAI
  |
Structured Agent Decision
  |
Deterministic Validation
  |
Tool Execution
  |
Supabase Job State
  |
Crew Notification
  |
Human Decision
  |
State Update
  |
Customer Notification
```

## Principles

1. **Environment-native interaction** — customers interact through WhatsApp, a channel they already use. No new app to install.
2. **Multimodal input** — text, voice notes, and images are all valid ways for a customer to describe a problem.
3. **Structured outputs** — the model's understanding is converted into a validated, typed structure before anything else happens.
4. **Deterministic execution** — application code, not the model, performs and confirms external actions.
5. **Persistent state** — every job has a durable, inspectable state that survives across messages and sessions.
6. **Human-in-the-loop** — consequential actions (accepting a job, dispatching a worker) require explicit human confirmation.
7. **Failure-aware design** — every integration point has a known, documented fallback (see [fallbacks.md](fallbacks.md)).
8. **Minimal architecture** — the simplest system that reliably completes the end-to-end flow wins over a more "complete" one.
9. **No microservices for hackathon** — a single Next.js app is sufficient; do not split into separate services.
10. **No unnecessary agent framework** — direct OpenAI API calls with structured outputs and tool calling are sufficient; do not introduce an agent orchestration framework unless a clear, specific need appears during the hackathon.

## Inbound Transport (implementation note)

`src/app/api/whatsapp/route.ts` is the real Twilio push webhook and the intended production path — implemented, tested with direct calls, and ready to receive Twilio's inbound POSTs as soon as the Sandbox (or a production WhatsApp sender) is configured to call it.

During this build, that one Console field could not be located in time, so a small additive fallback (`src/app/api/poll-inbound/route.ts`) pulls inbound messages via the Twilio REST API instead of waiting for a push, and calls the *same* `handleCustomerMessage`/`handleCrewMessage` functions the webhook uses. It is not a separate pipeline — it is an alternate trigger for the identical pipeline, made safe by the existing `provider_message_sid` idempotency check. This is documented as a known, temporary hackathon transport choice, not an architecture change.

## Related Docs

- [data-model.md](data-model.md) — planned entities
- [state-machine.md](state-machine.md) — planned job states and transitions
- [tool-contracts.md](tool-contracts.md) — planned agent tools
- [decisions.md](decisions.md) — locked-in architecture decisions
- [fallbacks.md](fallbacks.md) — Plan A/B/C for each integration
