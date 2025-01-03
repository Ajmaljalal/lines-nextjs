import { BaseAgent } from './base';
import { AgentContext, AgentResponse } from './types';
import { ChatAnthropic } from '@langchain/anthropic';
import { z } from "zod";

// Define the schema for newsletter sections
const newsletterSectionsSchema = z.object({
  header: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
  }),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
  })),
  footer: z.object({
    content: z.string(),
    callToAction: z.string().optional(),
  })
});

export class ContentDrafterAgent extends BaseAgent {
  private model: ChatAnthropic;

  constructor(context: AgentContext) {
    super(context);
    this.model = new ChatAnthropic({
      temperature: 0.5,
      model: "claude-3-5-sonnet-20241022",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      maxRetries: 3,
      maxTokens: 8000,
    });
  }

  protected processResponse(response: any): AgentResponse {
    return {
      content: response.content,
      metadata: response.metadata
    };
  }

  protected generatePrompt(): string {
    const { topic, content, urls, style } = this.context.data;

    return `Create a structured email/newsletter about "${topic}" based on the following [content, [urls], and [style]]. Make sure to include the content as much as possible. Do not include any other information. if there is no content, just make up content based on the topic.

    ${content ? `Use this content as reference: ${content}` : ''}
    ${urls?.length ? `Reference URLs: ${urls.join(', ')}` : ''}
    ${style ? `Style preferences: ${style}` : ''}

    Create a the email with:
    1. A header section with an engaging title and optional subtitle
    2. 3-5 content sections, each with a clear title and relevant conten, include urls and action buttons if applicable
    3. A footer section with a conclusion and optional call-to-action, social media links, and a subscription/unsubscribe link.

    Keep the content concise, engaging, and well-structured. Each section should be clearly distinct and relevant to the main topic.`;
  }

  public async execute(): Promise<AgentResponse> {
    try {
      const prompt = this.generatePrompt();

      const structuredModel = this.model.withStructuredOutput(newsletterSectionsSchema);
      const response = await structuredModel.invoke([
        { role: 'user', content: prompt, type: 'user' }
      ]);

      return {
        content: JSON.stringify(response),
        metadata: {
          type: 'draft_content',
          sections: response
        }
      };
    } catch (error) {
      console.error('Content drafter agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 