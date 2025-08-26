import { z } from 'zod';
import { AgentContext, AgentResponse } from './types';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseAgent } from './base_agent_data_collection';

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
  private model: ChatOpenAI;

  constructor(context: AgentContext) {
    super(context);
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.');
    }

    this.model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4.1",
      apiKey: apiKey,
      maxRetries: 3,
    });
  }

  protected generatePrompt(userInput: string): string {
    const { topic, userProvidedContent, urls, style, webSearch } = this.context.data;

    return `
    <prompt>
      <role>
        You are an AI assistant helping to gather information for an email campaign.
      </role>

      <current_state>
        <topic>${topic || 'Not set'}</topic>
        <content>${userProvidedContent || 'Not provided'}</content>
        <urls>${urls.length > 0 ? urls.join(', ') : 'None'}</urls>
        <style>${style || 'Not specified'}</style>
        <web_search>${webSearch ? 'Enabled' : 'Disabled'}</web_search>
      </current_state>

      <user_input>
        ${userInput}
      </user_input>

      <available_actions>
        <action>Update the email topic</action>
        <action>Update the user-provided content</action>
        <action>Add a reference URL</action>
        <action>Update the style preferences</action>
        <action>Toggle web search</action>
        <action>Confirm the current information is complete</action>
      </available_actions>

      <response_format>
        <description>Respond in JSON format with:</description>
        <schema>
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
        }
        </schema>
      </response_format>
    </prompt>`;
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

      // Update the email data based on the action
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