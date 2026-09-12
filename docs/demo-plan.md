# Demo Plan (Planned)

Status: this is a script to build toward and rehearse — none of it works yet. Do not claim these features already function.

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

## Notes

- This script exists to guide implementation priorities (see [build-plan.md](build-plan.md)) and rehearsal, not as a record of what currently works.
- See [fallbacks.md](fallbacks.md) if any component of this script is unreliable on demo day.
