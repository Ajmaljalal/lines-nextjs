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
      temperature: 0.1,
      model: "claude-3-5-sonnet-20241022",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      maxRetries: 3,
      maxTokens: 8192,
    });
  }

  private async generateWebContent(): Promise<any | null> {
    if (!this.context.data.webSearchContent?.length) return null;

    const prompt = `Create a structured email/newsletter about "${this.context.data.topic}" based on the following web search results. Follow the rules stated below.

    Web Search Results:
    ${this.context.data.webSearchContent.map(result => `
    Title: ${result.title}
    Content: ${result.content}
    Source: ${result.url}
    ---`).join('\n')}

    Create the email content with:
    1. A header section with an engaging title and optional subtitle
    2. 3-5 content sections, each with a clear title and relevant content
    3. A footer section with a conclusion and optional call-to-action

    Rules:
    - Use only the most recent and relevant information from the search results based on today's date
    - Maintain a neutral stance without bias
    - Keep content concise, engaging, and well-structured
    - Each section should be clearly distinct
    - Always cite sources by including the original URLs
    - Always include images if available

    Today's date is ${new Date().toISOString().split('T')[0]}.`;

    const structuredModel = this.model.withStructuredOutput(newsletterSectionsSchema);
    return await structuredModel.invoke([
      { role: 'user', content: prompt }
    ]);
  }

  private async generateUserContent(): Promise<any | null> {
    if (!this.context.data.userProvidedContent?.trim()) return null;

    const prompt = `Create a structured email/newsletter about "${this.context.data.topic}" based on the following user-provided content and style preferences. Follow the rules stated below.

    User Provided Content:
    ${this.context.data.userProvidedContent}

    ${this.context.data.urls?.length ? `Reference URLs:\n${this.context.data.urls.join('\n')}` : ''}
    ${this.context.data.style ? `Style preferences: ${this.context.data.style}` : ''}

    Create the email content with:
    1. A header section with an engaging title and optional subtitle
    2. 3-5 content sections, each with a clear title and relevant content
    3. A footer section with a conclusion and optional call-to-action

    Rules:
    - Use the provided content as the primary source, do not hallucinate
    - Maintain a neutral stance without bias
    - Keep content concise, engaging, and well-structured
    - Each section should be clearly distinct
    - Include provided URLs under each content section where appropriate
    - Always include images if available

    Today's date is ${new Date().toISOString().split('T')[0]}.`;

    const structuredModel = this.model.withStructuredOutput(newsletterSectionsSchema);
    return await structuredModel.invoke([
      { role: 'user', content: prompt }
    ]);
  }

  private mergeContent(webContent: any | null, userContent: any | null): any {
    if (!webContent && !userContent) {
      throw new Error('No content generated from either source');
    }

    if (!webContent) return userContent;
    if (!userContent) return webContent;

    // Merge the content from both sources
    return {
      header: {
        title: `${webContent.header.title} - ${userContent.header.title}`,
        subtitle: webContent.header.subtitle || userContent.header.subtitle,
      },
      sections: [
        ...webContent.sections,
        ...userContent.sections,
      ],
      footer: {
        content: `${webContent.footer.content}\n\n${userContent.footer.content}`,
        callToAction: webContent.footer.callToAction || userContent.footer.callToAction,
      }
    };
  }

  public async execute(): Promise<AgentResponse> {
    try {
      // Validate input data before processing
      if (!this.context.data.webSearchContent?.length && !this.context.data.userProvidedContent?.trim()) {
        throw new Error('No input content provided - both web search and user content are empty');
      }

      const [webContent, userContent] = await Promise.all([
        this.generateWebContent(),
        this.generateUserContent()
      ]);

      const mergedContent = this.mergeContent(webContent, userContent);

      return {
        content: JSON.stringify(mergedContent),
        metadata: {
          type: 'draft_content',
          sections: mergedContent,
          sourceType: webContent && userContent ? 'combined' :
            webContent ? 'web_only' : 'user_only'
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

  protected generatePrompt(): string {
    // This method won't be used since we're using direct model invocation
    return '';
  }

  protected processResponse(response: string): AgentResponse {
    // This method won't be used since we're using structured output
    return {
      content: response,
      metadata: {
        type: 'draft_content'
      }
    };
  }
}