import { z } from 'zod';
import { AgentContext, AgentResponse } from './types';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseAgent } from './base_agent';

const DataCollectionActionSchema = z.object({
  action: z.enum(['UPDATE_TOPIC', 'UPDATE_CONTENT', 'ADD_URL', 'UPDATE_STYLE', 'UPDATE_WEB_SEARCH', 'CONFIRM']),
  data: z.object({
    topic: z.string().optional(),
    content: z.string().optional(),
    url: z.string().optional(),
    style: z.string().optional(),
    webSearch: z.boolean().optional(),
  }),
  message: z.string(),
});

export class DataCollectionAgent extends BaseAgent {
  private model: ChatAnthropic;

  constructor(context: AgentContext) {
    super(context);
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not found. Please set NEXT_PUBLIC_ANTHROPIC_API_KEY in your environment variables.');
    }

    this.model = new ChatAnthropic({
      temperature: 0.7,
      model: "claude-3-sonnet-20240229",
      apiKey: apiKey,
      maxRetries: 3,
    });
  }

  protected generatePrompt(userInput: string): string {
    const { topic, userProvidedContent, urls, style, webSearch } = this.context.data;

    return `You are an AI assistant helping to gather information for a newsletter. Here's the current state:

Topic: ${topic || 'Not set'}
Content: ${userProvidedContent || 'Not provided'}
URLs: ${urls.length > 0 ? urls.join(', ') : 'None'}
Style: ${style || 'Not specified'}
Web Search: ${webSearch ? 'Enabled' : 'Disabled'}

User message: ${userInput}

Based on the user's message, determine the appropriate action to take. You can:
1. Update the newsletter topic
2. Update the user-provided content
3. Add a reference URL
4. Update the style preferences
5. Toggle web search
6. Confirm the current information is complete

Respond in JSON format with:
{
  "action": "UPDATE_TOPIC" | "UPDATE_CONTENT" | "ADD_URL" | "UPDATE_STYLE" | "UPDATE_WEB_SEARCH" | "CONFIRM",
  "data": {
    "topic": "string?",
    "content": "string?",
    "url": "string?",
    "style": "string?",
    "webSearch": "boolean?"
  },
  "message": "Your response message to the user"
}`;
  }

  protected async executePrompt(prompt: string): Promise<string> {
    const response = await this.model.invoke([
      new SystemMessage('You are a helpful AI assistant that responds in JSON format.'),
      new HumanMessage(prompt)
    ]);

    // Handle different types of message content
    if (typeof response.content === 'string') {
      return response.content;
    } else if (Array.isArray(response.content)) {
      // Handle array of content parts, safely extracting text
      return response.content.map(part =>
        typeof part === 'string' ? part : ('text' in part ? part.text : '')
      ).join('');
    } else {
      // Handle single content part safely
      return 'text' in response.content ? (response.content as { text: string }).text : '';
    }
  }

  protected async processResponse(response: string): Promise<AgentResponse> {
    try {
      const parsedResponse = JSON.parse(response);
      const validatedResponse = DataCollectionActionSchema.parse(parsedResponse);

      // Update the newsletter data based on the action
      const updates: Record<string, any> = {};
      switch (validatedResponse.action) {
        case 'UPDATE_TOPIC':
          if (validatedResponse.data.topic) {
            updates.topic = validatedResponse.data.topic;
          }
          break;
        case 'UPDATE_CONTENT':
          if (validatedResponse.data.content) {
            updates.userProvidedContent = validatedResponse.data.content;
          }
          break;
        case 'ADD_URL':
          if (validatedResponse.data.url) {
            const currentUrls = new Set(this.context.data.urls);
            currentUrls.add(validatedResponse.data.url);
            updates.urls = Array.from(currentUrls);
          }
          break;
        case 'UPDATE_STYLE':
          if (validatedResponse.data.style) {
            updates.style = validatedResponse.data.style;
          }
          break;
        case 'UPDATE_WEB_SEARCH':
          if (typeof validatedResponse.data.webSearch === 'boolean') {
            updates.webSearch = validatedResponse.data.webSearch;
          }
          break;
      }

      return {
        content: validatedResponse.message,
        metadata: {
          action: validatedResponse.action,
          updates
        }
      };
    } catch (error) {
      console.error('Error processing agent response:', error);
      return {
        content: "I apologize, but I couldn't process that request correctly. Could you please rephrase it?",
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 