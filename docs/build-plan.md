# Build Plan

Strict hackathon implementation sequence. This plan exists so build day starts executing immediately instead of re-deciding architecture.

## Phase 0 — Start

- Confirm environment variables
- Initialize project (install dependencies)
- Create first hackathon commit
- Verify local server runs

## Phase 1 — Basic E2E

Goal: real WhatsApp input → server → real WhatsApp reply.

Do this before adding any AI complexity.

## Phase 2 — Agent

- OpenAI integration
- Structured output
- Basic context extraction
- Determine next action

## Phase 3 — Persistence

- Supabase
- Jobs
- Messages
- Job state

## Phase 4 — Multimodal

- Voice
- Transcription
- Image

## Phase 5 — Crew

- Worker notification
- Recognize worker role
- ACCEPT workflow
- Update customer

## Phase 6 — Reliability

- Validation
- Duplicate protection
- Error handling
- Logs

## Phase 7 — Demo

- Run exact scripted demo (see [demo-plan.md](demo-plan.md))
- Fix only demo-blocking issues

## Phase 8 — Feature Freeze

No new functionality.

## Phase 9 — Submission

- README
- Screenshots
- Architecture
- Record 2-minute video
- GitHub public
- Description
- Social post

## Rules

- Working E2E at T+90 minutes is more valuable than an ambitious incomplete system.
- Feature freeze target: approximately T+2h45.
- After feature freeze: only reliability, documentation, demo, and submission work.

---

## Claude Execution Contract

When implementation begins tomorrow:

### DO

- Follow existing architecture
- Prioritize working E2E
- Use TypeScript
- Keep functions small
- Use Zod at AI/external-data boundaries
- Use explicit types
- Validate model outputs
- Log state transitions
- Log external tool failures
- Keep messaging provider isolated behind a service module
- Keep OpenAI isolated behind a service module
- Keep Supabase isolated behind a service module
- Make webhook processing idempotent where practical
- Preserve customer conversation context
- Distinguish CUSTOMER and CREW senders deterministically
- Only notify the customer after real action success
- Use environment variables
- Fail visibly rather than silently
- Prefer boring, reliable code
- Minimize dependencies
- Keep the demo flow easy to debug

### DO NOT

- Redesign the product
- Rename the project
- Change the vertical
- Add features not requested
- Build a CRM
- Build authentication
- Build payments
- Build quotes
- Build marketplace logic
- Build calendar integration
- Build analytics
- Build dashboards unless needed for debugging/demo
- Create multiple AI agents
- Add agent frameworks without clear need
- Add a vector database
- Add RAG
- Add Exa
- Add Auth0
- Add OpenRouter
- Add CopilotKit
- Add Trigger.dev unless the core flow already works
- Build complex worker scheduling
- Implement automatic price generation
- Invent contractor availability
- Invent successful external actions
- Create fake production integrations
- Spend time polishing landing pages before P0 tests pass
- Refactor working code for aesthetics during build time
- Replace a working simple solution with a complex one
- Change providers after E2E works unless the current provider is broken

---

## Token / Time Efficiency Rules

Follow these while coding tomorrow:

1. Do not repeatedly explain architecture.
2. Do not brainstorm alternatives unless blocked.
3. Do not produce long essays.
4. Inspect existing files before editing.
5. Make the smallest change that completes the current build phase.
6. Prefer direct implementation over proposing options.
7. Do not ask permission for obvious implementation steps.
8. Do not regenerate entire files unnecessarily.
9. Do not refactor unrelated code.
10. Do not add speculative future abstractions.
11. If blocked, identify ONE practical fallback and implement it.
12. Preserve working functionality.
13. Run the relevant test after each critical integration.
14. Move immediately to the next build phase after success.
15. Stop adding features at feature freeze.
