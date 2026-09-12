# DaVinci

From customer message to field action.

DaVinci is an autonomous AI field dispatcher designed to turn multimodal customer conversations into coordinated field-service actions while keeping humans in control of consequential decisions.

## Hackathon Status

This repository has been prepared as a starter structure. DaVinci's hackathon-specific core functionality will be implemented during the official hackathon period.

## Problem

Field-service workers (plumbers, HVAC techs, electricians) cannot constantly stop working to read and respond to customer messages. Important requests — especially urgent ones — get delayed, lost in text threads, or require a dispatcher to manually re-type them into a job.

## Intended Experience

Customer → WhatsApp → DaVinci → multimodal understanding → structured job state → decision/tool execution → field worker → human decision → DaVinci → customer updated

Customers may send text, voice notes, images, incomplete descriptions, location, availability, or urgent requests. DaVinci is intended to understand this input, extract structured job information, determine service type and urgency, remember context, ask only for missing critical information, create/update job state, notify a field worker, wait for human acceptance, and update the customer once a real action succeeds.

## Planned Architecture

See [docs/architecture.md](docs/architecture.md) for the full planned system design.

## Planned Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- OpenAI
- Twilio WhatsApp Sandbox
- Supabase PostgreSQL
- Google Cloud Run (Vercel as fallback)
- Trigger.dev (optional)

## Build Status

- [ ] WhatsApp inbound
- [ ] WhatsApp outbound
- [ ] Text understanding
- [ ] Voice transcription
- [ ] Image understanding
- [ ] Structured job extraction
- [ ] Job persistence
- [ ] Crew notification
- [ ] Human acceptance
- [ ] Customer follow-up
- [ ] Demo tested

## Demo

Demo details will be added after implementation.

## Running Locally

This project has not yet been initialized with installed dependencies. Once ready:

```bash
npm install
npm run dev
```

## Environment Variables

See [.env.example](.env.example) for the full list of required and optional variables.

## Hackathon

Built for AI Tinkerers — Agents, Everywhere.
