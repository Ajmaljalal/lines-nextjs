import { BaseAgent } from './base';
import { AgentContext, AgentResponse } from './types';
import { ChatAnthropic } from '@langchain/anthropic';
import { z } from "zod";

const dataCollectionResponseSchema = z.object({
  action: z.enum(['update_field', 'validate_data', 'request_info', 'confirm_completion']),
  field: z.string().optional(),
  value: z.any().optional(),
  message: z.string(),
});

export class DataCollectionAgent extends BaseAgent {
  private model: ChatAnthropic;

  constructor(context: AgentContext) {
    super(context);
    this.model = new ChatAnthropic({
      temperature: 0.1,
      model: "claude-3-sonnet-20240229",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      maxRetries: 3,
    });
  }

  protected generatePrompt(): string {
    const { topic, userProvidedContent, urls, style, webSearch } = this.context.data;

    return `
    <prompt>
      <role>
        You are an AI assistant helping users collect and validate data for their newsletter. Guide them through providing:
        1. Topic (required)
        2. Content (optional)
        3. Reference URLs (optional)
        4. Style preferences (optional)
        5. Web search preference (optional)
      </role>

      <current_state>
        <topic>${topic || 'Not provided'}</topic>
        <content>${userProvidedContent || 'Not provided'}</content>
        <urls>${JSON.stringify(urls || [])}</urls>
        <style>${style || 'Not provided'}</style>
        <web_search>${webSearch ? 'Enabled' : 'Disabled'}</web_search>
      </current_state>

      <task>
        Help the user provide or refine the newsletter data. If they ask questions, answer them.
        If they provide information, validate it and suggest improvements.
        Guide them through the process naturally and conversationally.
      </task>

      <response_format>
        Return a JSON object with:
        - action: The type of action to take (update_field, validate_data, request_info, confirm_completion)
        - field: The field to update (if applicable)
        - value: The value to set (if applicable)
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
        type: 'data_collection',
        action: response.action,
        field: response.field,
        value: response.value
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
      const structuredModel = this.model.withStructuredOutput(dataCollectionResponseSchema);
      const response = await structuredModel.invoke([
        { role: 'user', content: prompt }
      ]);

      this.context.messages.push({
        role: 'assistant',
        content: response.message
      });

      return this.processResponse(response);
    } catch (error) {
      console.error('Data collection agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 