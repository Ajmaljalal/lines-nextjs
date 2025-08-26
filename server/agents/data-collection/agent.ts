import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseServerAgent } from '../base/base-agent';
import { AgentContext, AgentResponse, AgentConfig, AgentCapability } from '../base/types';

const DataCollectionActionSchema = z.object({
  action: z.enum(['UPDATE_DATA', 'CONFIRM', 'ASK_FOR_MORE']),
  data: z.object({
    topic: z.string().optional(),
    content: z.string().optional(),
    urls: z.array(z.string()).optional(),
    style: z.string().optional(),
    webSearch: z.boolean().optional(),
  }),
  message: z.string(),
  extractedInfo: z.object({
    topic: z.string().optional(),
    content: z.string().optional(),
    urls: z.array(z.string()).optional(),
    style: z.string().optional(),
  }).optional(),
});

export class DataCollectionServerAgent extends BaseServerAgent {
  private model: ChatOpenAI;
  private config: AgentConfig;

  constructor(context: AgentContext, config: AgentConfig = {}) {
    super(context);
    this.config = config;

    // Use server-side environment variables (without NEXT_PUBLIC prefix)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY in your environment variables.');
    }

    this.model = new ChatOpenAI({
      temperature: config.temperature || 0.7,
      model: config.model || "gpt-4o-mini",
      apiKey: apiKey,
      maxRetries: config.maxRetries || 3,
    });
  }

  protected generatePrompt(userInput?: string): string {
    const { topic, userProvidedContent, urls, style, webSearch } = this.context.data;

    return `
    <prompt>
      <role>
        You are an intelligent data extraction assistant for email marketing campaigns. Your job is to analyze user messages and extract ALL relevant information to fill out an email campaign form. You should extract multiple pieces of information from a single message when possible.
      </role>

      <current_form_state>
        <topic>${topic || 'Not filled'}</topic>
        <content>${userProvidedContent || 'Not filled'}</content>
        <urls>${(urls?.length ?? 0) > 0 ? urls!.join(', ') : 'None'}</urls>
        <style>${style || 'Not specified'}</style>
        <web_search>${webSearch ? 'Enabled' : 'Not set'}</web_search>
      </current_form_state>

      <user_message>
        ${userInput || ''}
      </user_message>

      <extraction_instructions>
        Analyze the user's message and extract:
        1. **Topic**: What is the email about? Extract the main subject/theme
        2. **Content**: Any specific content, descriptions, or details they want included
        3. **URLs**: Any websites, links, or domains mentioned (including https://, http://, www., or just domain names)
        4. **Style**: Any style preferences (formal, casual, professional, friendly, persuasive, etc.)
        5. **Web Search**: Do they want you to search for additional information?

        Examples of extraction:
        - "Write about https://apexacademy.tech/" → topic: "Apex Academy", urls: ["https://apexacademy.tech/"]
        - "Create a casual email about our new product launch" → topic: "product launch", style: "casual"
        - "Write a professional email about cybersecurity, include stats from recent breaches" → topic: "cybersecurity", style: "professional", webSearch: true
      </extraction_instructions>

      <response_format>
        <description>Always respond in this JSON format:</description>
        <schema>
        {
          "action": "UPDATE_DATA" | "CONFIRM" | "ASK_FOR_MORE",
          "data": {
            "topic": "extracted or updated topic string",
            "content": "extracted content details", 
            "urls": ["array", "of", "extracted", "urls"],
            "style": "extracted style preference",
            "webSearch": true/false
          },
          "extractedInfo": {
            "topic": "what topic you found",
            "content": "what content details you found",
            "urls": ["what", "urls", "you", "found"],
            "style": "what style you detected"
          },
          "message": "Natural response to the user explaining what you extracted and what might still be needed"
        }
        </schema>
      </response_format>

      <action_guidelines>
        - Use "UPDATE_DATA" when you extract any information from the user's message
        - Use "ASK_FOR_MORE" when you need clarification or more details for empty fields
        - Use "CONFIRM" only when all required fields (topic at minimum) are filled and user seems ready to proceed
        - Always try to extract as much as possible from each message
        - Include existing data in your response if not updating it
      </action_guidelines>
    </prompt>`;
  }

  protected async callLLM(prompt: string): Promise<string> {
    const response = await this.model.invoke([
      new SystemMessage('You are a helpful AI assistant that responds in JSON format.'),
      new HumanMessage(prompt)
    ]);

    // Handle different types of message content
    if (typeof response.content === 'string') {
      return response.content;
    } else if (Array.isArray(response.content)) {
      return response.content.map(part =>
        typeof part === 'string' ? part : ('text' in part ? part.text : '')
      ).join('');
    } else {
      return 'text' in response.content ? (response.content as { text: string }).text : '';
    }
  }

  protected processResponse(response: string): AgentResponse {
    try {
      const parsedResponse = JSON.parse(response);
      const validatedResponse = DataCollectionActionSchema.parse(parsedResponse);

      // Extract and merge updates from the data object
      const updates: Record<string, any> = {};

      // Update all provided fields
      if (validatedResponse.data.topic) {
        updates.topic = validatedResponse.data.topic;
      }

      if (validatedResponse.data.content) {
        updates.userProvidedContent = validatedResponse.data.content;
      }

      if (validatedResponse.data.urls && validatedResponse.data.urls.length > 0) {
        // Merge with existing URLs
        const currentUrls = new Set(this.context.data.urls || []);
        validatedResponse.data.urls.forEach(url => currentUrls.add(url));
        updates.urls = Array.from(currentUrls);
      }

      if (validatedResponse.data.style) {
        updates.style = validatedResponse.data.style;
      }

      if (typeof validatedResponse.data.webSearch === 'boolean') {
        updates.webSearch = validatedResponse.data.webSearch;
      }

      return {
        content: validatedResponse.message,
        metadata: {
          action: validatedResponse.action,
          updates,
          extractedInfo: validatedResponse.extractedInfo
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

  public getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'data_collection',
        description: 'Collect and organize information for email campaigns',
        inputSchema: DataCollectionActionSchema,
        outputSchema: DataCollectionActionSchema
      }
    ];
  }
}
