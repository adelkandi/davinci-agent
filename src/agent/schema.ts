import { z } from "zod";
import { SERVICE_TYPES, URGENCY_LEVELS } from "@/types/job";

export const NEXT_ACTIONS = ["ASK_CUSTOMER", "QUALIFY_JOB", "ESCALATE_HUMAN"] as const;

export const agentDecisionSchema = z.object({
  intent: z.string(),
  serviceType: z.enum(SERVICE_TYPES),
  urgency: z.enum(URGENCY_LEVELS),
  description: z.string(),
  city: z.string().nullable(),
  address: z.string().nullable(),
  preferredDate: z.string().nullable(),
  preferredTime: z.string().nullable(),
  missingInformation: z.array(z.string()),
  safetyConcern: z.boolean(),
  safetyReason: z.string().nullable(),
  nextAction: z.enum(NEXT_ACTIONS),
  customerResponse: z.string(),
  aiSummary: z.string(),
});

export type AgentDecision = z.infer<typeof agentDecisionSchema>;
