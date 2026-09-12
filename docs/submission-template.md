# Submission Template

## Project Title

DaVinci — From Customer Message to Field Action

## Short Description

An autonomous AI field dispatcher that turns messy WhatsApp messages — text, voice, photos — into structured, qualified jobs and coordinates a human crew to accept and act on them, with a human always confirming the consequential step.

## Long Description

Field-service workers (plumbers, electricians, HVAC techs) can't stop mid-job to parse a customer's fragmented WhatsApp messages. DaVinci sits between the customer and the crew: it understands unstructured multimodal input (text, voice notes, photos), merges it into one persistent job record, asks only for what's actually missing, flags real safety/urgency signals, and — once a job has enough information to act on — notifies a real crew member over WhatsApp. A human explicitly accepts the job; only after that real acceptance does the customer get a confirmation. No step in the chain is simulated: every state transition is gated on a verified external success (a confirmed Twilio send, a confirmed Supabase write), never on the model's own claim.

## Problem

Field-service workers cannot constantly stop working to process customer messages, so requests — especially urgent ones — get delayed or lost.

## Solution

A single Next.js app: one Twilio WhatsApp webhook, one OpenAI-backed decision agent, one Supabase schema (`jobs`, `messages`, `agent_events`), and a small set of deterministic tool functions (`createJob`, `updateJob`, `markUrgent`, `notifyCrew`, `assignWorker`, `notifyCustomer`, `requestHumanAction`). The model produces a structured, Zod-validated decision every turn; application code — not the model — decides whether a job is qualified, whether a state transition is legal, and whether an external action actually succeeded before acting on that assumption.

## Why Messaging Is Essential

The customer's actual behavior — sending a voice note while standing in a flooded basement, then a photo, then an address a minute later — is exactly what WhatsApp is for and exactly what a form is not. The product only works because it meets the customer where fragmented, multimodal communication already happens, and meets the crew on the phone they're already using in the field.

## Agentic Behavior

Each turn: unstructured input (text/transcript/image observation) → OpenAI produces a typed decision (service type, urgency, missing info, next action, safety assessment) → Zod validates it (one retry, then a safe fallback if still invalid) → deterministic code decides what changes on the job and whether it's ready to qualify → a tool executes the resulting external action (Twilio send, Supabase write) → the tool's actual, verified result — not the model's claim — decides the next state transition → the customer/crew gets a response built from real persisted state.

## Technical Architecture

See [architecture.md](architecture.md) — matches what was actually built, including an honest note on the inbound-transport fallback used during this build (see below).

## Human-in-the-Loop

A job never gets dispatched or resolved without a human: a real crew member must reply `ACCEPT` on their own phone before a job is assigned, and the customer is only told a technician accepted *after* that acceptance is persisted and the confirmation send is confirmed — never before, never based on an assumption.

## Demo Flow

See [demo-plan.md](demo-plan.md) — the scripted killer demo, run and verified 3 times on real physical devices.

## Technology Used

Next.js (App Router), React, TypeScript, Zod, OpenAI (`gpt-4o-mini`, `whisper-1`), Twilio WhatsApp Sandbox, Supabase PostgreSQL, Tailwind CSS.

## Sponsor Technologies Used

OpenAI, Twilio, Supabase.

## GitHub URL

TODO (fill in after pushing to a public repo)

## Demo Video URL

TODO (fill in after recording)

## Social Post URL

TODO (fill in after posting)

## Known Limitations

- Inbound WhatsApp messages were relayed through a REST-API polling fallback (`/api/poll-inbound`, ~4s interval) rather than Twilio's push webhook, because the Sandbox's webhook configuration field could not be located in the Twilio Console during the build window. The real webhook (`/api/whatsapp`) is fully implemented, tested, and ready — it just needs that one Console field (or a production WhatsApp sender) pointed at it.
- Not deployed to Cloud Run/Vercel for this submission; tested via local server + Cloudflare quick tunnel.
- French input and non-English flows were not explicitly tested.
- No automatic pricing, scheduling, or worker-availability logic — by design (see decisions.md).

## What Was Built During the Hackathon

Everything under `src/` and `supabase/migrations/` — the webhook, the agent (prompt, schema, decision logic), the Supabase repository layer, the state machine, the customer and crew pipelines, the deterministic tools, voice transcription and image analysis wired into the same pipeline, the polling fallback, and Mission Control — was implemented and verified live during the hackathon build session on top of the pre-hackathon documentation/scaffolding (docs, `package.json`, env config, empty service stubs).
