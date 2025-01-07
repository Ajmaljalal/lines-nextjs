import { BaseAgent } from './base';
import { AgentContext, AgentResponse } from './types';
import { ChatAnthropic } from '@langchain/anthropic';
import { z } from "zod";

const contentEditingResponseSchema = z.object({
  action: z.enum(['edit_section', 'add_section', 'remove_section', 'update_style', 'validate_content']),
  section: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  message: z.string(),
});

export class ContentEditingAgent extends BaseAgent {
  private model: ChatAnthropic;

  constructor(context: AgentContext) {
    super(context);
    this.model = new ChatAnthropic({
      temperature: 0.7,
      model: "claude-3-sonnet-20240229",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      maxRetries: 3,
    });
  }

  protected generatePrompt(): string {
    const { generatedContent } = this.context.data;
    const content = generatedContent ? JSON.parse(generatedContent) : null;

    return `
    <prompt>
      <role>
        You are an AI assistant helping users edit and refine their newsletter content. You can help them:
        1. Edit existing sections
        2. Add new sections
        3. Remove sections
        4. Update the style and tone
        5. Validate content quality
      </role>

      <current_content>
        ${JSON.stringify(content, null, 2)}
      </current_content>

      <task>
        Help the user improve their newsletter content. If they ask to edit a section,
        help them refine it. If they want to add or remove sections, guide them through it.
        Maintain a consistent style and tone throughout the newsletter.
      </task>

      <response_format>
        Return a JSON object with:
        - action: The type of action to take (edit_section, add_section, remove_section, update_style, validate_content)
        - section: The section details (if applicable)
          - id: Section identifier
          - title: Section title
          - content: Section content
        - message: The message to show to the user
      </response_format>

      <conversation_history>
        ${JSON.stringify(this.context.messages)}
      </conversation_history>
    </prompt>`;
  }

  protected processResponse(response: any): AgentResponse {
    return {
      content: response.message,
      metadata: {
        type: 'content_editing',
        action: response.action,
        section: response.section
      }
    };
  }

  public async execute(input?: string): Promise<AgentResponse> {
    try {
      if (input) {
        this.context.messages.push({
          role: 'user',
          content: input
        });
      }

      const prompt = this.generatePrompt();
      const structuredModel = this.model.withStructuredOutput(contentEditingResponseSchema);
      const response = await structuredModel.invoke([
        { role: 'user', content: prompt }
      ]);

      this.context.messages.push({
        role: 'assistant',
        content: response.message
      });

      return this.processResponse(response);
    } catch (error) {
      console.error('Content editing agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 