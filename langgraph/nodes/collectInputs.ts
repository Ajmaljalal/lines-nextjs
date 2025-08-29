import { z } from "zod";
import { interrupt } from "@langchain/langgraph";
import { getChatModel } from "../llm";
import { MarketingEmailState } from "../types";

export async function collectInputs(state: MarketingEmailState): Promise<MarketingEmailState> {
  const hasMinimum = Boolean(state.topic && (state.contentDraft || (state.urls && state.urls.length > 0)));
  if (hasMinimum) {
    return { ...state, stage: "collect" };
  }

  const chat = getChatModel();
  const system = `You are a helpful assistant collecting inputs to draft a marketing email.
Ask concise follow-up questions until you can fill: topic, audience, contentDraft, urls, images, brandStyle.
Extract any URLs even if partial (complete them), infer brandStyle if the user hints at colors, tone, or fonts.
Return ONLY a strict JSON object matching the provided JSON schema.`;

  // Relaxed schemas for LLM extraction to avoid provider constraints on url format
  const LLMImageSchema = z.object({ url: z.string(), alt: z.string().optional() });
  const LLMBrandStyleSchema = z.object({
    tone: z.string().optional(),
    palette: z.array(z.string()).optional(),
    fonts: z.array(z.string()).optional(),
    logoUrl: z.string().optional(),
  });
  const ExtractionSchema = z.object({
    topic: z.string().min(1).optional(),
    audience: z.string().optional(),
    contentDraft: z.string().optional(),
    urls: z.array(z.string()).optional(),
    images: z.array(LLMImageSchema).optional(),
    brandStyle: LLMBrandStyleSchema.optional(),
  });

  function hasMinimumInputs(s: MarketingEmailState) {
    return Boolean(s.topic && (s.contentDraft || (s.urls && s.urls.length > 0)));
  }

  let working: MarketingEmailState = { ...state };

  // Keep collecting until we have the minimum inputs to draft
  while (!hasMinimumInputs(working)) {
    const missing: string[] = [];
    if (!working.topic) missing.push("topic");
    if (!working.contentDraft && !(working.urls && working.urls.length > 0)) missing.push("content or urls");
    if (!working.audience) missing.push("audience (optional)");
    if (!working.images) missing.push("images (optional)");
    if (!working.brandStyle) missing.push("brand style (optional)");

    const question = `Please share missing details (${missing.join(", ")}). You can answer in natural language.`;
    const userReply = interrupt({ question, missing });

    const response = await chat.withStructuredOutput(ExtractionSchema).invoke([
      { role: "system", content: system },
      { role: "user", content: String(userReply ?? "") },
    ]);

    // Merge extracted fields
    working = {
      ...working,
      topic: response.topic ?? working.topic,
      audience: response.audience ?? working.audience,
      contentDraft: response.contentDraft ?? working.contentDraft,
      urls: response.urls ?? working.urls,
      images: response.images ?? working.images,
      brandStyle: response.brandStyle ?? working.brandStyle,
    };
  }

  return { ...working, stage: "collect" };
}


