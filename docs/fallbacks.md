# Fallback Plans

Principle: never let an optional integration destroy the end-to-end demo.

## Core Path Fallbacks

**Plan A**
Customer WhatsApp → Twilio → DaVinci → Worker WhatsApp → worker replies ACCEPT → customer updated.

**Plan B**
Customer remains on real WhatsApp. Crew action occurs through a minimal web Mission Control instead of WhatsApp replies (used if worker-side WhatsApp interaction proves unreliable).

**Plan C**
If WhatsApp integration catastrophically fails during the hackathon, use a messaging simulator (e.g. a simple web chat UI standing in for WhatsApp) while preserving the same backend/agent architecture underneath.

## Component-Level Fallbacks

| If this fails | Fall back to |
|---|---|
| Voice transcription | Text equivalent (customer/demo types instead of speaking) |
| Image understanding | Continue with voice/text only |
| OpenAI vision | Text/voice classification only |
| Database (Supabase) | Temporary in-memory state, for demo purposes only |
| Deployment (Cloud Run) | Run through a local tunnel (e.g. ngrok-style) |
| Trigger.dev | Remove it entirely — it is optional |
| Cloud Run becomes slow/unreliable | Deploy using Vercel instead |

## Principle

Never let an optional integration destroy the end-to-end demo. Every non-core dependency must have a documented way to be bypassed without losing the customer → AI → worker → AI → customer flow.
