# Demo Plan

Status: verified. This exact script has been run successfully end-to-end on real physical devices (real Twilio WhatsApp, real OpenAI, real Supabase) multiple times, including 3 consecutive clean reliability runs.

## Primary Demo Script

1. Customer sends a WhatsApp voice note:

   > "Hi, my basement is flooding. I think something broke near my water heater. I'm in Nepean and I need someone today."

2. Customer also sends a demo image (e.g. of the affected area).

3. Expected extracted context:
   - service: plumbing
   - problem: active water leak near water heater
   - location: Nepean
   - availability: today
   - urgency: high
   - missing: exact service address

4. Expected DaVinci response:

   > "I can help with that. Since the leak is active, I'll flag this as urgent. What's the service address?"

5. Customer responds with a fictional demo address.

6. Worker receives a concise, actionable job summary.

7. Worker replies: `ACCEPT`

8. Job transitions to ACCEPTED.

9. Customer receives a confirmation message.

## Backup Demo (Text-Only)

If voice/image cannot be relied on live, run the identical script with the customer typing the same message as text and skipping the image — the rest of the flow (qualification, urgency flag, address follow-up, crew notification, ACCEPT, customer confirmation) stays the same.

## Verified Result (this build)

Ran exactly as scripted: voice note + photo converged into one job, DaVinci asked only for the missing address, qualification triggered deterministically once description+address were both present, crew got a real WhatsApp notification built from persisted job state (confirmed **read** on the physical crew phone), ACCEPT assigned the worker and only then notified the customer (confirmed **read**/**delivered** on the physical customer phone). No invented ETA, price, or availability at any point. Ran 3 times total; two real bugs surfaced and were fixed during testing (an agent JSON schema edge case, and a voice-note content-type/extension mismatch for `audio/mp4` notes) — see git history for details.

## 2-Minute Video Script (timed)

**0:00–0:15 — Setup shot.** Show both phones (customer + crew) side by side, and the Mission Control page in a browser tab. One line of narration: "DaVinci turns a messy WhatsApp conversation into a coordinated field job — no forms, no dispatcher typing things up."

**0:15–0:35 — Customer sends the voice note** ("Hi, my basement is flooding...I'm in Nepean and I need someone today.") and the demo photo. Cut to Mission Control / phone screen showing DaVinci's reply asking only for the address — call out on-screen text: "It didn't ask what's wrong or where — it already knows. It only asks for what's missing."

**0:35–0:45 — Customer sends the address** ("123 Demo Street."). Show the reply acknowledging urgency.

**0:45–1:05 — Cut to the crew phone.** Show the real WhatsApp notification arriving — narrate that it's built from the actual persisted job (service, address, urgency, and ✓ marks for photo/voice evidence), not a canned message.

**1:05–1:20 — Crew replies `ACCEPT`.**

**1:20–1:35 — Cut back to customer phone** showing the real confirmation message arriving ("Good news — a technician has accepted your request...").

**1:35–1:55 — Cut to Mission Control**, showing the same job's full state (status `CUSTOMER_NOTIFIED`, assigned worker, urgency, evidence flags) and the `agent_events` trace — this is the "look, nothing was faked" beat for judges.

**1:55–2:00 — Close** on the tagline: "From customer message to field action."

## Live Demo Note

For this build, inbound messages are delivered via a REST-API polling fallback (`/api/poll-inbound`) rather than Twilio's push webhook, because the Sandbox's webhook field wasn't reachable in the Twilio Console during the build window. Before recording the final demo video, either locate that Console field or keep the poll loop running in the background — both work identically from the pipeline's perspective. See [architecture.md](architecture.md#inbound-transport-implementation-note).

## Notes

- See [fallbacks.md](fallbacks.md) if any component of this script becomes unreliable on demo day.
