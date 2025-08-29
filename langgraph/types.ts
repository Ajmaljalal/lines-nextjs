import { z } from "zod";

export const ImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
});

export const BrandStyleSchema = z.object({
  tone: z.string().optional(),
  palette: z.array(z.string()).optional(),
  fonts: z.array(z.string()).optional(),
  logoUrl: z.string().url().optional(),
});

export const MarketingEmailStateSchema = z.object({
  // Collected inputs
  topic: z.string().optional(),
  audience: z.string().optional(),
  contentDraft: z.string().optional(),
  urls: z.array(z.string()).optional(),
  images: z.array(ImageSchema).optional(),
  brandStyle: BrandStyleSchema.optional(),

  // Conversation tracking for natural flow
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).optional(),

  // Node completion flags (set by LLM when node objectives are met)
  inputCollectionComplete: z.boolean().optional(),
  contentDraftComplete: z.boolean().optional(),
  emailDesignComplete: z.boolean().optional(),

  // Working and outputs
  plainTextDraft: z.string().optional(),
  finalHtml: z.string().optional(),
  confirmedPlainText: z.boolean().optional(),

  // Legacy stage tracking (deprecated, use completion flags instead)
  stage: z.enum(["collect", "draft", "design"]).optional(),
});

export type MarketingEmailState = z.infer<typeof MarketingEmailStateSchema>;


