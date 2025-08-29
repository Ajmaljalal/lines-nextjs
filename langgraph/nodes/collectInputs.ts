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

  function normalizeUrlMaybe(value: string): string | undefined {
    let v = (value || "").trim();
    if (!v) return undefined;
    if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
    try {
      const u = new URL(v);
      return u.toString();
    } catch {
      return undefined;
    }
  }

  function normalizeUrls(values?: string[]): string[] | undefined {
    if (!values) return undefined;
    const out = values
      .map((u) => normalizeUrlMaybe(u))
      .filter((u): u is string => Boolean(u));
    return out.length ? out : undefined;
  }

  function normalizeImages(values?: { url: string; alt?: string }[]): { url: string; alt?: string }[] | undefined {
    if (!values) return undefined;
    const out: { url: string; alt?: string }[] = [];
    for (const img of values) {
      const url = normalizeUrlMaybe(img.url);
      if (!url) continue;
      out.push({ url, alt: img.alt });
    }
    return out.length ? out : undefined;
  }

  let working: MarketingEmailState = { ...state };

  // Ordered, conversational collection flow
  const steps: Array<"topic" | "contentDraft" | "urls" | "images" | "audience" | "brandStyle"> = [
    "topic",
    "contentDraft",
    "urls",
    "images",
    "audience",
    "brandStyle",
  ];

  const stepPrompts: Record<typeof steps[number], string> = {
    topic: "What is the topic of the email?",
    contentDraft: "Do you have any content or notes to include? If not, say 'skip'.",
    urls: "Share any URLs to include (we'll complete partial links), or say 'skip'.",
    images: "Share any images (URLs and optional alt text), or say 'skip'.",
    audience: "Who is the audience (e.g., parents, developers)? Or say 'skip'.",
    brandStyle: "Any brand style preferences (tone, colors, fonts, logo URL)? Or say 'skip'.",
  };

  let stepIndex = 0;
  while (stepIndex < steps.length) {
    const field = steps[stepIndex];

    // If current field already present, move to next
    if (
      (field === "topic" && working.topic) ||
      (field === "contentDraft" && working.contentDraft) ||
      (field === "urls" && working.urls && working.urls.length > 0) ||
      (field === "images" && working.images && working.images.length > 0) ||
      (field === "audience" && working.audience) ||
      (field === "brandStyle" && working.brandStyle)
    ) {
      stepIndex += 1;
      continue;
    }

    const userReply = interrupt({ question: stepPrompts[field], step: field });

    // Allow skipping optional steps
    if (typeof userReply === "string" && userReply.trim().toLowerCase() === "skip") {
      stepIndex += 1;
      continue;
    }

    const response = await chat.withStructuredOutput(ExtractionSchema).invoke([
      { role: "system", content: system },
      { role: "user", content: String(userReply ?? "") },
    ]);

    // Normalize and merge extracted fields
    const normalizedUrls = normalizeUrls(response.urls);
    const normalizedImages = normalizeImages(response.images);
    const normalizedLogo = response.brandStyle?.logoUrl ? normalizeUrlMaybe(response.brandStyle.logoUrl) : undefined;
    const mergedBrand = response.brandStyle
      ? { ...response.brandStyle, logoUrl: normalizedLogo ?? undefined }
      : undefined;

    working = {
      ...working,
      topic: response.topic ?? working.topic,
      audience: response.audience ?? working.audience,
      contentDraft: response.contentDraft ?? working.contentDraft,
      urls: normalizedUrls ?? working.urls,
      images: normalizedImages ?? working.images,
      brandStyle: mergedBrand ?? working.brandStyle,
    };

    // Only proceed to next step if current field is now satisfied or optional
    stepIndex += 1;
  }

  // Ensure minimum requirement met before proceeding
  if (!hasMinimumInputs(working)) {
    const userReply = interrupt({
      question: "We still need a topic and either some content or at least one URL.",
      missing: {
        topic: !working.topic,
        contentOrUrls: !(working.contentDraft || (working.urls && working.urls.length > 0)),
      },
    });

    const response = await chat.withStructuredOutput(ExtractionSchema).invoke([
      { role: "system", content: system },
      { role: "user", content: String(userReply ?? "") },
    ]);

    working = {
      ...working,
      topic: response.topic ?? working.topic,
      contentDraft: response.contentDraft ?? working.contentDraft,
      urls: normalizeUrls(response.urls) ?? working.urls,
    };
  }

  return { ...working, stage: "collect" };
}


