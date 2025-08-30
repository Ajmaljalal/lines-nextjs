import { z } from 'zod';

// Base schemas
export const AgentMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string()
});

export const BrandThemeSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  textColor: z.string(),
  backgroundColor: z.string(),
  logoUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  unsubscribeUrl: z.string().optional(),
  socialMediaUrls: z.record(z.string()).optional()
});

export const ContentDataSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  topic: z.string().optional(),
  userProvidedContent: z.string().optional(),
  generatedContent: z.string().optional(),
  htmlContent: z.string().optional(),
  urls: z.array(z.string()).optional(),
  style: z.string().optional(),
  webSearch: z.boolean().optional(),
  webSearchContent: z.array(z.object({
    title: z.string(),
    content: z.string(),
    url: z.string()
  })).optional(),
  urlsExtractedContent: z.array(z.string()).optional(),
  contentType: z.string().optional(),
  senderName: z.string().optional(),
  fromEmail: z.string().optional(),
  subject: z.string().optional(),
  recipients: z.array(z.string()).optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const AgentContextSchema = z.object({
  messages: z.array(AgentMessageSchema),
  data: ContentDataSchema
});

// Agent request schemas
export const ChatAgentRequestSchema = z.object({
  message: z.string(),
  context: AgentContextSchema,
  brandTheme: BrandThemeSchema.optional().nullable()
});

export const ContentGenerationRequestSchema = z.object({
  data: ContentDataSchema,
  brandTheme: BrandThemeSchema.optional().nullable()
});

export const HtmlGenerationRequestSchema = z.object({
  data: ContentDataSchema,
  brandTheme: BrandThemeSchema.optional().nullable()
});

// Service request schemas
export const WebSearchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  includeImages: z.boolean().optional().default(false),
  includeAnswer: z.boolean().optional().default(true),
  searchDepth: z.enum(['basic', 'advanced']).optional().default('basic'),
  maxResults: z.number().int().min(1).max(20).optional().default(5)
});

export const UrlExtractionRequestSchema = z.object({
  urls: z.array(z.string().url('Invalid URL format')).min(1, 'At least one URL is required')
});

// Response schemas
export const AgentResponseSchema = z.object({
  content: z.string(),
  metadata: z.record(z.any()).optional().nullable(),
  error: z.string().optional().nullable()
});

export const ContentGenerationResponseSchema = z.object({
  content: z.array(z.string()),
  error: z.string().optional().nullable()
});

export const HtmlGenerationResponseSchema = z.object({
  content: z.string(),
  error: z.string().optional().nullable()
});

export const WebSearchResponseSchema = z.object({
  results: z.array(z.object({
    title: z.string(),
    content: z.string(),
    url: z.string(),
    score: z.number().optional().nullable()
  })),
  answer: z.string().optional().nullable(),
  error: z.string().optional().nullable()
});

export const UrlExtractionResponseSchema = z.object({
  results: z.array(z.object({
    url: z.string(),
    title: z.string().optional().nullable(),
    raw_content: z.string(),
    status_code: z.number().optional().nullable()
  })),
  error: z.string().optional().nullable()
});

// Type exports
export type AgentMessage = z.infer<typeof AgentMessageSchema>;
export type BrandTheme = z.infer<typeof BrandThemeSchema>;
export type ContentData = z.infer<typeof ContentDataSchema>;
export type AgentContext = z.infer<typeof AgentContextSchema>;
export type ChatAgentRequest = z.infer<typeof ChatAgentRequestSchema>;
export type ContentGenerationRequest = z.infer<typeof ContentGenerationRequestSchema>;
export type HtmlGenerationRequest = z.infer<typeof HtmlGenerationRequestSchema>;
export type WebSearchRequest = z.infer<typeof WebSearchRequestSchema>;
export type UrlExtractionRequest = z.infer<typeof UrlExtractionRequestSchema>;
export type AgentResponse = z.infer<typeof AgentResponseSchema>;
export type ContentGenerationResponse = z.infer<typeof ContentGenerationResponseSchema>;
export type HtmlGenerationResponse = z.infer<typeof HtmlGenerationResponseSchema>;
export type WebSearchResponse = z.infer<typeof WebSearchResponseSchema>;
export type UrlExtractionResponse = z.infer<typeof UrlExtractionResponseSchema>;
