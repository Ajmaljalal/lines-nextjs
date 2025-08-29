import { z } from "zod";
import { interrupt } from "@langchain/langgraph";
import { getChatModel } from "../llm";
import { MarketingEmailState, BrandStyleSchema, ImageSchema } from "../types";

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

  const schema = z.object({
    topic: z.string().min(1).optional(),
    audience: z.string().optional(),
    contentDraft: z.string().optional(),
    urls: z.array(z.string()).optional(),
    images: z.array(ImageSchema).optional(),
    brandStyle: BrandStyleSchema.optional(),
  });

  const question = `Please share any missing details:
- Topic
- Audience
- Content draft (if any)
- URLs to include (we will complete partial URLs)
- Images (url + optional alt)
- Brand style (tone, colors, fonts, logo)
Reply naturally.`;

  const userReply = interrupt({
    question,
    expected: ["topic", "audience", "contentDraft", "urls", "images", "brandStyle"],
  });

  const response = await chat.withStructuredOutput(schema).invoke([
    { role: "system", content: system },
    { role: "user", content: String(userReply ?? "") },
  ]);

  const merged: MarketingEmailState = {
    ...state,
    topic: response.topic ?? state.topic,
    audience: response.audience ?? state.audience,
    contentDraft: response.contentDraft ?? state.contentDraft,
    urls: response.urls ?? state.urls,
    images: response.images ?? state.images,
    brandStyle: response.brandStyle ?? state.brandStyle,
    stage: "collect",
  };

  return merged;
}


