import { BaseAgent } from './base';
import { AgentContext, AgentResponse } from './types';
import { ChatGroq } from '@langchain/groq';
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
  private model: ChatGroq;

  constructor(context: AgentContext) {
    super(context);
    this.model = new ChatGroq({
      temperature: 0.7,
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY
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

    return `Create a structured newsletter about "${topic}" with clear sections.

${content ? `Use this content as reference: ${content}` : ''}
${urls?.length ? `Reference URLs: ${urls.join(', ')}` : ''}
${style ? `Style preferences: ${style}` : ''}

Create a newsletter with:
1. A header section with an engaging title and optional subtitle
2. 2-3 content sections, each with a clear title and relevant content
3. A footer section with a conclusion and optional call-to-action

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