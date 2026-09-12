import { getOpenAIClient, TEXT_MODEL } from "@/services/openai-client";
import { logger } from "@/lib/logger";
import { Job } from "@/types/job";
import { agentDecisionSchema, AgentDecision } from "./schema";
import { SYSTEM_PROMPT } from "./prompt";

interface DecideInput {
  job: Job;
  latestMessageText: string;
}

function buildUserPrompt({ job, latestMessageText }: DecideInput): string {
  const known = {
    serviceType: job.serviceType,
    urgency: job.urgency,
    description: job.description,
    city: job.city,
    address: job.address,
    preferredDate: job.preferredDate,
    preferredTime: job.preferredTime,
  };

  return [
    `Known job state (preserve unless contradicted): ${JSON.stringify(known)}`,
    "",
    `New message context from the customer (may include a transcript and/or an image observation appended to the text): """${latestMessageText}"""`,
    "",
    "Respond with a JSON object with exactly these keys: intent, serviceType, urgency, description, city, address, preferredDate, preferredTime, missingInformation, safetyConcern, safetyReason, nextAction, customerResponse, aiSummary.",
  ].join("\n");
}

function fallbackDecision(job: Job): AgentDecision {
  return {
    intent: "unknown",
    serviceType: job.serviceType,
    urgency: job.urgency,
    description: job.description ?? "",
    city: job.city,
    address: job.address,
    preferredDate: job.preferredDate,
    preferredTime: job.preferredTime,
    missingInformation: job.address ? [] : ["address"],
    safetyConcern: false,
    safetyReason: null,
    nextAction: "ASK_CUSTOMER",
    customerResponse:
      "Sorry, I had trouble processing that. Could you tell me the service address and a short description of the problem?",
    aiSummary: job.aiSummary ?? job.description ?? "Job details pending.",
  };
}

async function callModel(systemPrompt: string, userPrompt: string): Promise<unknown> {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: TEXT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  const raw = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw);
}

export async function runAgent(input: DecideInput): Promise<AgentDecision> {
  const userPrompt = buildUserPrompt(input);

  try {
    const raw = await callModel(SYSTEM_PROMPT, userPrompt);
    const parsed = agentDecisionSchema.safeParse(raw);
    if (parsed.success) return parsed.data;

    logger.warn("AGENT_DECISION_INVALID_RETRYING", { error: parsed.error.message });
    const retryPrompt = `${userPrompt}\n\nYour previous response failed validation: ${parsed.error.message}. Return valid JSON matching the schema exactly.`;
    const retryRaw = await callModel(SYSTEM_PROMPT, retryPrompt);
    const retryParsed = agentDecisionSchema.safeParse(retryRaw);
    if (retryParsed.success) return retryParsed.data;

    logger.error("AGENT_DECISION_INVALID_FALLBACK", { error: retryParsed.error.message });
    return fallbackDecision(input.job);
  } catch (error) {
    logger.error("AGENT_DECISION_ERROR", { error: error instanceof Error ? error.message : String(error) });
    return fallbackDecision(input.job);
  }
}
