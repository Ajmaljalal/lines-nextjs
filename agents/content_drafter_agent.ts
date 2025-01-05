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
    url: z.string(),
    image: z.string().optional(),
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
      temperature: 0.4,
      model: "claude-3-5-sonnet-20241022",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      maxRetries: 3,
      maxTokens: 8192,
    });
  }

  protected processResponse(response: any): AgentResponse {
    return {
      content: response.content,
      metadata: response.metadata
    };
  }

  protected generatePrompt(): string {
    const { topic, userProvidedContent, webSearchContent, urls, style } = this.context.data;

    return `Create a structured email/newsletter about "${topic}" based on the following [userProvidedContent], [webSearchContent], [urls], and [style]]. Make sure to include the content as much as possible. Do not include any other information. if there is no content, make up content based on the topic. Follow the [rules] stated below.

    ${userProvidedContent ? `Use this user provided content as reference: ${userProvidedContent}` : ''}
    ${webSearchContent ? `Use this web search content as reference: ${webSearchContent}` : ''}
    ${urls?.length ? `Reference URLs: ${urls.join(', ')}` : ''}
    ${style ? `Style preferences: ${style}` : ''}

    Create the email content with:
    1. A header section with an engaging title and optional subtitle
    2. 3-5 content sections, each with a clear title and relevant conten, include urls and action buttons if applicable
    3. A footer section with a conclusion and optional call-to-action, social media links, and a subscription/unsubscribe link.
    4. Make sure to include the most recent content from the web search.
    5. If the web search content contains urls, include the urls in each section.

    Keep the content concise, engaging, and well-structured. Each section should be clearly distinct and relevant to the main topic.

    Rules:
    - Make sure to remain neutral and not biased towards any political party, ideology, or religion.
    - From the web search content, only use the content that is relevant to the topic.
    - If the web search content is not relevant to the topic, ignore it.
    - From the web search content, use the most recent content.

    Today's date is ${new Date().toISOString().split('T')[0]}.
    `;
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