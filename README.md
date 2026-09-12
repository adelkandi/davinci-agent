# DaVinci

From customer message to field action.

DaVinci is an autonomous AI field dispatcher designed to turn multimodal customer conversations into coordinated field-service actions while keeping humans in control of consequential decisions.

## Hackathon Status

Core end-to-end flow is implemented and verified on real physical devices (real Twilio WhatsApp, real OpenAI, real Supabase): customer message → structured job → crew notification → ACCEPT → customer confirmation, including voice and image inputs converging into a single job.

## Problem

Field-service workers (plumbers, HVAC techs, electricians) cannot constantly stop working to read and respond to customer messages. Important requests — especially urgent ones — get delayed, lost in text threads, or require a dispatcher to manually re-type them into a job.

## Intended Experience

Customer → WhatsApp → DaVinci → multimodal understanding → structured job state → decision/tool execution → field worker → human decision → DaVinci → customer updated

Customers may send text, voice notes, images, incomplete descriptions, location, availability, or urgent requests. DaVinci is intended to understand this input, extract structured job information, determine service type and urgency, remember context, ask only for missing critical information, create/update job state, notify a field worker, wait for human acceptance, and update the customer once a real action succeeds.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full system design.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- OpenAI (`gpt-4o-mini` for structured decisions + vision, `whisper-1` for transcription)
- Twilio WhatsApp Sandbox
- Supabase PostgreSQL
- Deployment target: Google Cloud Run via source/buildpacks (Vercel as fallback) — not yet deployed for this build

## Build Status

- [x] WhatsApp inbound (real webhook at `/api/whatsapp`; see [Inbound Transport](#inbound-transport-note) below)
- [x] WhatsApp outbound
- [x] Text understanding
- [x] Voice transcription
- [x] Image understanding
- [x] Structured job extraction (Zod-validated, one retry, safe fallback)
- [x] Job persistence (Supabase: `jobs`, `messages`, `agent_events`)
- [x] Crew notification
- [x] Human acceptance (ACCEPT / DECLINE / INFO)
- [x] Customer follow-up
- [x] Demo tested — 3/3 clean runs on real physical devices

## Inbound Transport Note

The real push webhook (`/api/whatsapp`) is fully implemented and is the intended production path. During this build, the Twilio Sandbox's "when a message comes in" field could not be located in the current Twilio Console UI in time, so inbound messages were picked up instead via `/api/poll-inbound` — a small additive route that lists recent inbound messages through the Twilio REST API (Twilio always records them regardless of webhook config) and feeds them through the *exact same* `handleCustomerMessage`/`handleCrewMessage` pipeline as the real webhook. Existing `provider_message_sid` idempotency makes repeated polling safe. This is a hackathon transport fallback, not a redesign — once the Sandbox webhook (or a production WhatsApp sender) is configured, `/api/whatsapp` takes over with zero pipeline changes.

## Demo

See [docs/demo-plan.md](docs/demo-plan.md) for the verified killer-demo script and results.

## Running Locally

```bash
npm install
cp .env.example .env.local   # fill in real credentials, never commit this file
npm run dev
```

The WhatsApp webhook is at `POST /api/whatsapp`. A minimal read-only operational view (jobs + recent agent events) is at `/mission-control`.

## Environment Variables

See [.env.example](.env.example) for the full list of required and optional variables.

## Hackathon

Built for AI Tinkerers — Agents, Everywhere.
