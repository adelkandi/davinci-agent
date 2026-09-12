import OpenAI from "openai";
import { requireEnv } from "@/lib/env";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
  }
  return client;
}

export const TEXT_MODEL = "gpt-4o-mini";
export const VISION_MODEL = "gpt-4o-mini";
export const TRANSCRIPTION_MODEL = "whisper-1";

/** Transcribe a downloaded audio buffer. Throws on failure — caller decides fallback. */
export async function transcribeAudio(buffer: Buffer, contentType: string): Promise<string> {
  const openai = getOpenAIClient();
  const file = new File([new Uint8Array(buffer)], "voice-note.ogg", {
    type: contentType || "audio/ogg",
  });
  const result = await openai.audio.transcriptions.create({
    file,
    model: TRANSCRIPTION_MODEL,
  });
  return result.text.trim();
}

/** Produce a concise, uncertainty-aware operational observation from an image. */
export async function describeImage(buffer: Buffer, contentType: string): Promise<string> {
  const openai = getOpenAIClient();
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${contentType || "image/jpeg"};base64,${base64}`;

  const response = await openai.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You describe photos submitted for a home-services job (plumbing/HVAC/electrical/repair). " +
          "Report only what is visibly observable, in one or two short sentences, using uncertainty-aware " +
          "language (e.g. 'appears to', 'visible'). Do not diagnose root cause or claim certainty about a " +
          "fault unless it is unambiguous from the image (e.g. clearly visible fire). This is context for a " +
          "field crew, not a guaranteed diagnosis.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Describe what is operationally relevant in this photo." },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    max_tokens: 150,
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}
