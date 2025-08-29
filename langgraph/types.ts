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

  // Working and outputs (simple version)
  plainTextDraft: z.string().optional(),
  finalHtml: z.string().optional(),
  confirmedPlainText: z.boolean().optional(),

  // Simple stage tracking for this MVP
  stage: z.enum(["collect", "draft", "design"]).optional(),
});

export type MarketingEmailState = z.infer<typeof MarketingEmailStateSchema>;


