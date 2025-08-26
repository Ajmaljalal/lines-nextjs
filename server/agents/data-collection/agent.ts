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
      model: config.model || "gpt-4o",
      apiKey: apiKey,
      maxRetries: config.maxRetries || 3,
    });
  }

  protected generatePrompt(userInput: string): string {
    const { topic, userProvidedContent, urls, style, webSearch } = this.context.data;

    return `
    You are a data collection agent. Your job is to extract the information from your conversation with the user.
    You will need to extract the topic, urls, content, style, and webSearch from your conversation with the user.

    EXTRACT THESE DETAILS:
    - Topic: What is the email about? extract the email topic from the message, if you don't find the topic, ask the user for the topic
    - URLs: ANY web addresses mentioned (https://, http://, www., .com, .org, etc.) extract the urls from the message, if you don't find the urls, ask the user if they want to add any urls
    - Content: Specific details they want included, extract the content from the message, if you don't find the content, ask the user if they want to add any content
    - Style: Writing preferences mentioned, extract the writing style from the message, if you don't find the style, ask the user for the style
    - WebSearch: Do they want additional information? extract the web search true or false from the message, if you don't find the web search, ask the user if they want to add any web search

    EXAMPLES OF EXTRACTION:
    "write an email about apex academy https://apexacademy.tech/" 
    → Topic: "Apex Academy", URLs: ["https://apexacademy.tech/"], WebSearch: true

    "it is about apex academy"
    → Topic: "Apex Academy"

    "casual email about our new product"
    → Topic: "new product", Style: "casual"

    "write about cybersecurity trends"
    → Topic: "cybersecurity trends", WebSearch: true

    CRITICAL RULES:
    1. ALWAYS extract something if the user mentions ANY topic, company, or subject
    2. If you find ANY information, use action "UPDATE_DATA" 
    3. Only use "ASK_FOR_MORE" if the message is truly empty or unclear
    4. Extract company names as topics (e.g., "apex academy" → topic: "Apex Academy")
    5. Extract all URLs, even partial ones

         CONVERSATION HISTORY:
     ${this.context.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
     

     Current state of the data so far collected: Topic: ${topic || 'Not filled'}, URLs: ${(urls?.length ?? 0) > 0 ? urls!.join(', ') : 'None'}
     
     Understand the user's request and extract information or engage in conversation with the user to gather more information.

     CURRENT USER MESSAGE: "${userInput}"

    `
  }

  protected async callLLM(prompt: string): Promise<string> {
    // Use structured output to ensure proper JSON formatting
    const structuredModel = this.model.withStructuredOutput(DataCollectionActionSchema);

    const result = await structuredModel.invoke([
      new SystemMessage('You are a helpful AI assistant that extracts information from user messages.'),
      new HumanMessage(prompt)
    ]);

    // Return the structured result as JSON string
    return JSON.stringify(result);
  }

  protected processResponse(response: string): AgentResponse {
    try {
      // Since we're using structured output, the response should already be valid JSON
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
