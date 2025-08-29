import { z } from "zod";
import { interrupt } from "@langchain/langgraph";
import { getChatModel } from "../llm";
import { MarketingEmailState } from "../types";

export async function collectInputs(state: MarketingEmailState): Promise<MarketingEmailState> {
  // If input collection is already complete, just return
  if (state.inputCollectionComplete) {
    return state;
  }

  const chat = getChatModel();

  // Helper functions for data normalization
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

  function hasMinimumInputs(s: MarketingEmailState) {
    return Boolean(s.topic && (s.contentDraft || (s.urls && s.urls.length > 0)));
  }

  // Initialize conversation history if not present and create working copy
  let working: MarketingEmailState = {
    ...state,
    conversationHistory: state.conversationHistory || []
  };

  // Comprehensive system prompt for conversational data collection
  const systemPrompt = `You are a friendly marketing email assistant helping a user create a marketing email. Your goal is to gather the necessary information through natural conversation.

CONVERSATION FLOW:
- If this is the first interaction (no conversation history), introduce yourself warmly and ask about their email topic
- For ongoing conversations, respond naturally based on what they've shared and what's still needed
- Be conversational, helpful, and adaptive to their communication style

INFORMATION NEEDED:
1. REQUIRED:
   - Topic/purpose of the email (what is this email about?)
   - Content source: EITHER content draft OR URLs to reference

2. OPTIONAL (but helpful):
   - Target audience (who will receive this email?)
   - Brand style preferences (tone, colors, fonts, logo URL)
   - Images to include (image URLs with optional alt text)

CONVERSATION GUIDELINES:
- Be conversational, friendly, and natural like talking to a colleague
- Ask follow-up questions when responses are unclear or incomplete
- Allow users to provide multiple pieces of information at once
- Let users correct or update previous information
- Don't force a rigid order - adapt to how the user wants to share information
- If they provide everything at once, acknowledge what you received and ask for any missing required items
- If they want to change something they said before, that's totally fine

CURRENT STATUS TRACKING:
Based on the conversation so far, here's what has been collected:
- Topic: ${working.topic ? `"${working.topic}"` : "❌ NOT PROVIDED"}
- Content Draft: ${working.contentDraft ? `"${working.contentDraft.substring(0, 100)}${working.contentDraft.length > 100 ? '...' : ''}"` : "❌ NOT PROVIDED"}
- URLs: ${working.urls && working.urls.length > 0 ? `${working.urls.length} URL(s): ${working.urls.join(', ')}` : "❌ NOT PROVIDED"}
- Target Audience: ${working.audience ? `"${working.audience}"` : "⚪ Optional - not provided"}
- Brand Style: ${working.brandStyle ? `Provided (tone: ${working.brandStyle.tone || 'none'}, colors: ${working.brandStyle.palette?.length || 0}, fonts: ${working.brandStyle.fonts?.length || 0}, logo: ${working.brandStyle.logoUrl ? 'yes' : 'no'})` : "⚪ Optional - not provided"}
- Images: ${working.images && working.images.length > 0 ? `${working.images.length} image(s)` : "⚪ Optional - not provided"}

RESPONSE FORMAT:
Respond with a JSON object containing:
{
  "message": "Your conversational response to the user",
  "extractedData": {
    "topic": "string or null",
    "contentDraft": "string or null", 
    "urls": ["array of url strings or null"],
    "images": [{"url": "string", "alt": "string or null"}] or null,
    "audience": "string or null",
    "brandStyle": {
      "tone": "string or null",
      "palette": ["array of color strings or null"],
      "fonts": ["array of font strings or null"], 
      "logoUrl": "string or null"
    } or null
  },
  "inputCollectionComplete": boolean // true if we have ALL the information needed to proceed to content drafting (topic + either contentDraft or urls)
}

COMPLETION CRITERIA:
Set "inputCollectionComplete" to true ONLY when you have:
1. A clear topic/purpose for the email
2. EITHER content draft OR at least one URL to reference
3. The user seems satisfied with the information provided and ready to proceed

Do NOT mark as complete if:
- The user is asking clarifying questions
- The user wants to add or change something
- The information provided is too vague or incomplete
- You sense the user wants to continue the conversation

IMPORTANT: Only extract data that the user actually provided in their latest message. Don't repeat previously collected data in extractedData - that will be merged separately. Set fields to null if not mentioned in the current message.

Based on the above instructions and current status, analyze what the user wants/asks/provides in the following message`;

  // Schema for LLM response
  const ConversationResponseSchema = z.object({
    message: z.string(),
    extractedData: z.object({
      topic: z.string().nullable(),
      contentDraft: z.string().nullable(),
      urls: z.array(z.string()).nullable(),
      images: z.array(z.object({
        url: z.string(),
        alt: z.string().nullable()
      })).nullable(),
      audience: z.string().nullable(),
      brandStyle: z.object({
        tone: z.string().nullable(),
        palette: z.array(z.string()).nullable(),
        fonts: z.array(z.string()).nullable(),
        logoUrl: z.string().nullable()
      }).nullable()
    }),
    inputCollectionComplete: z.boolean()
  });

  // Start conversation loop - continue until LLM determines collection is complete
  while (!working.inputCollectionComplete) {
    // Determine the initial message or get user input
    let userMessage: string;

    if (working.conversationHistory!.length === 0) {
      // First interaction - let the LLM introduce itself naturally
      userMessage = "Hi there! I'd like to create a marketing email.";
    } else {
      // Get user's next message
      const userInput = interrupt({
        question: working.conversationHistory![working.conversationHistory!.length - 1].content,
        conversationSoFar: working.conversationHistory!
      });
      userMessage = String(userInput ?? "");
    }

    // Build conversation history for LLM context
    const conversationMessages = [
      { role: "system" as const, content: systemPrompt },
      ...working.conversationHistory!.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user" as const, content: userMessage }
    ];

    // Get LLM response
    const response = await chat.withStructuredOutput(ConversationResponseSchema).invoke(conversationMessages);

    // Update conversation history
    working.conversationHistory = [
      ...working.conversationHistory!,
      { role: "user", content: userMessage },
      { role: "assistant", content: response.message }
    ];

    // Extract and normalize new data from this interaction
    const extracted = response.extractedData;

    // Merge extracted data with existing data
    if (extracted.topic) {
      working.topic = extracted.topic;
    }

    if (extracted.contentDraft) {
      working.contentDraft = extracted.contentDraft;
    }

    if (extracted.urls) {
      const normalized = normalizeUrls(extracted.urls);
      if (normalized) {
        working.urls = [...(working.urls || []), ...normalized];
      }
    }

    if (extracted.images) {
      const normalized = normalizeImages(extracted.images.map(img => ({
        url: img.url,
        alt: img.alt || undefined
      })));
      if (normalized) {
        working.images = [...(working.images || []), ...normalized];
      }
    }

    if (extracted.audience) {
      working.audience = extracted.audience;
    }

    if (extracted.brandStyle) {
      const normalizedLogo = extracted.brandStyle.logoUrl ? normalizeUrlMaybe(extracted.brandStyle.logoUrl) : undefined;
      working.brandStyle = {
        ...working.brandStyle,
        tone: extracted.brandStyle.tone ?? working.brandStyle?.tone,
        palette: extracted.brandStyle.palette ?? working.brandStyle?.palette,
        fonts: extracted.brandStyle.fonts ?? working.brandStyle?.fonts,
        logoUrl: normalizedLogo ?? working.brandStyle?.logoUrl
      };
    }

    // Set completion status based on LLM determination
    working.inputCollectionComplete = response.inputCollectionComplete;

    // If LLM indicates completion, break
    if (response.inputCollectionComplete) {
      break;
    }
  }

  return working;
}


