# Decisions

These decisions are FINAL for the hackathon unless a real API limitation blocks them.

| Area | Decision |
|---|---|
| Project | DaVinci |
| Product | Autonomous AI Field Dispatcher |
| Vertical | Home services / contractors (plumbing, HVAC, electrical, emergency repairs) |
| Primary environment | WhatsApp |
| Messaging integration | Twilio WhatsApp Sandbox |
| AI | OpenAI |
| Database | Supabase PostgreSQL |
| Frontend/backend | Next.js + TypeScript |
| Human control | Required for accepting jobs and any other consequential action |
| MVP | One complete customer → AI → worker → AI → customer workflow |
| Primary optimization | Reliability and demo clarity |
| Not optimizing for | Feature count |

We optimize for a robust 2-minute demonstration, not a broad product.

## Safety / Product Rules

Documented only today — implementation follows these rules once the hackathon build begins.

DaVinci must:

- Not diagnose dangerous situations
- Detect likely emergency/high-risk situations
- Advise appropriate emergency action when necessary
- Not promise worker arrival unless accepted
- Not invent prices
- Not invent availability
- Escalate uncertainty on consequential information
- Allow human control
- Keep responses concise
- Match customer language when practical
- Avoid repeatedly asking for information already provided
