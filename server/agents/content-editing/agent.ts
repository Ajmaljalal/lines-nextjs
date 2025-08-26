import { z } from 'zod';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseServerAgent } from '../base/base-agent';
import { AgentContext, AgentResponse, AgentConfig, AgentCapability } from '../base/types';

const contentEditingResponseSchema = z.object({
  action: z.enum(['edit_section', 'add_section', 'remove_section', 'update_style', 'validate_content']),
  section: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  message: z.string(),
});

export class ContentEditingServerAgent extends BaseServerAgent {
  private model: ChatAnthropic;
  private config: AgentConfig;

  constructor(context: AgentContext, config: AgentConfig = {}) {
    super(context);
    this.config = config;

    // Use server-side environment variables
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not found. Please set ANTHROPIC_API_KEY in your environment variables.');
    }

    this.model = new ChatAnthropic({
      temperature: config.temperature || 0.7,
      model: config.model || "claude-3-5-sonnet-20241022",
      apiKey: apiKey,
      maxRetries: config.maxRetries || 3,
    });
  }

  protected generatePrompt(userInput?: string): string {
    const { generatedContent } = this.context.data;
    const content = generatedContent ? JSON.parse(generatedContent) : null;

    return `
    <prompt>
      <role>
        You are an AI assistant helping to edit email content. You will receive the current content and a request for changes.
      </role>

      <current_content>
        ${JSON.stringify(content, null, 2)}
      </current_content>

      <user_request>
        ${userInput || ''}
      </user_request>

      <task>
        Update the email content based on the user's request. Return the COMPLETE updated content structure.
        Maintain the same JSON structure but with the requested changes applied.
      </task>

      <response_format>
        Return a JSON object with:
        {
          "updatedContent": {
            // The complete email content structure with changes
          },
          "message": "Explanation of changes made"
        }
      </response_format>
    </prompt>`;
  }

  protected async callLLM(prompt: string): Promise<string> {
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

    return content;
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

  public async execute(input: { data: any; messages?: any[]; brandTheme?: any; userInput?: string }): Promise<{ content: string; metadata?: any; error?: string }> {
    try {
      // Update context with input data
      if (input.data) {
        this.context.data = { ...this.context.data, ...input.data };
      }
      if (input.brandTheme) {
        this.brandTheme = input.brandTheme;
        this.context.brandTheme = input.brandTheme;
      }
      if (input.messages) {
        this.context.messages = [...this.context.messages, ...input.messages];
      }

      if (!input.userInput) {
        return { content: '', error: 'No user input provided' };
      }

      const prompt = this.generatePrompt(input.userInput);
      const response = await this.callLLM(prompt);
      const processedResponse = this.processResponse(response);

      return {
        content: processedResponse.content,
        metadata: processedResponse.metadata,
        error: processedResponse.error
      };
    } catch (error) {
      console.error('Content editing agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  public getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'content_editing',
        description: 'Edit and modify email content based on user requests',
        inputSchema: contentEditingResponseSchema,
        outputSchema: contentEditingResponseSchema
      }
    ];
  }
}
