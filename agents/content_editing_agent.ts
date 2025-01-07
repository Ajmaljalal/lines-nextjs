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
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not found');
    }

    this.model = new ChatAnthropic({
      temperature: 0.7,
      model: "claude-3-5-sonnet-20241022",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      maxRetries: 3,
      maxTokens: 8192,
    });
  }

  protected generatePrompt(userInput?: string): string {
    const { generatedContent } = this.context.data;
    const content = generatedContent ? JSON.parse(generatedContent) : null;

    return `
    <prompt>
      <role>
        You are an AI assistant helping to edit newsletter content. You will receive the current content and a request for changes.
      </role>

      <current_content>
        ${JSON.stringify(content, null, 2)}
      </current_content>

      <user_request>
        ${userInput || ''}
      </user_request>

      <task>
        Update the newsletter content based on the user's request. Return the COMPLETE updated content structure.
        Maintain the same JSON structure but with the requested changes applied.
      </task>

      <response_format>
        Return a JSON object with:
        {
          "updatedContent": {
            // The complete newsletter content structure with changes
          },
          "message": "Explanation of changes made"
        }
      </response_format>
    </prompt>`;
  }

  public async execute(input?: string): Promise<AgentResponse> {
    try {
      if (!input) return { content: '', error: 'No input provided' };

      const prompt = this.generatePrompt(input);
      const response = await this.model.invoke([
        { role: 'user', content: prompt }
      ]);

      // Handle different types of message content
      const content = Array.isArray(response.content)
        ? response.content.map(part =>
          typeof part === 'string' ? part : ('text' in part ? part.text : '')
        ).join('')
        : typeof response.content === 'string'
          ? response.content
          : 'text' in response.content
            ? (response.content as { text: string }).text
            : '';

      return this.processResponse(content);
    } catch (error) {
      console.error('Content editing agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  protected processResponse(response: string): AgentResponse {
    try {
      const result = JSON.parse(response);
      return {
        content: result.message,
        metadata: {
          type: 'content_update',
          updates: {
            generatedContent: JSON.stringify(result.updatedContent)
          }
        }
      };
    } catch (error) {
      throw new Error('Failed to process response: ' + error);
    }
  }
} 