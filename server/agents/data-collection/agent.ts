import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseServerAgent } from '../base/base-agent';
import { AgentContext, AgentResponse, AgentConfig, AgentCapability } from '../base/types';

const DataCollectionActionSchema = z.object({
  action: z.enum(['UPDATE_DATA', 'CONFIRM', 'ASK_FOR_MORE']),
  message: z.string(),
  data: z.object({
    topic: z.string().optional(),
    content: z.string().optional(),
    urls: z.array(z.string()).optional(),
    imageUrls: z.array(z.string()).optional(),
    style: z.string().optional(),
    audience: z.string().optional(),
    webSearch: z.boolean().optional(),
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
    const { topic, userProvidedContent, urls, style, webSearch, imageUrls, audience } = this.context.data;

    return `
    You are part of a marketing email creation process. You are a data collection agent. You are smart, proactive and helpful. 
    Your job is to extract, infer, and ask questions to get the topic, urls, content, image urls, style of the email, audience, and the need for a web search from your conversation with the user.
    When collecting data, go step by step and do not skip any steps or do not combine steps together.

    EXTRACT THESE DETAILS:
    - Topic (required):
       1. What is the email about? is it about a specific topic, product, service, event, etc.
       2. If product, what is the product name, type and other relavent things.
       3. If service, what is the service name, type and other relavent things.
       4. If event, what is the event name, type, location, and other relavent things.
       5. If topic is not clear, ask the user for the topic
    - URLs to extract content from (if any):
       1. ANY web addresses mentioned (https://, http://, www., .com, .org, etc.)
       2. Complete the urls if it is missing parts.
       3. Extract the urls from the message, if you don't find the urls, ask the user if they want to add any urls
    - Content that will be used to generate the email (if any):
       1. Specific details they want included,
       2. Extract the content from the message, if you don't find the content, ask the user if they want to add any content
    - Image URLs that will be used in the email (if any):
      1. Any image urls mentioned regarding the topic,
      2. Extract the image urls from the message, if you don't find the image urls, ask the user if they want to add any image urls
    - Style:
      1. The look and feel, tone, and other writing style mentioned,
      2.Extract the writing style from the message, if you don't find the style, ask the user for the style
    - Audience (required):
      1. Who is the email for?
      2. Extract the audience from the message, if you don't find the audience, ask the user for the audience
    - WebSearch (required):
      1. Should be true or false, Do they want additional information?
      2. Extract the web search true or false from the message, if you don't find the web search, ask the user if they want to add any web search


    CRITICAL RULES:
    1. ALWAYS extract something if the user mentions ANY topic, company, or subject, if not, ask the user for the topic
    2. If you find ANY information, use action "UPDATE_DATA"
    3. Only use "ASK_FOR_MORE" if the message is truly empty or unclear
    4. Extract all URLs, even partial ones, and then complete the urls with the full url like the https or wwww or .com sections if missing.
    5. Extract all image urls, even partial ones and then complete the image urls with the full url like the https or wwww or .com sections if missing.
    6. If you are not sure about the image or other urls, ask the user for the image urls or other urls.
    7. If you are not sure about the style, ask the user for the style.
    8. If you are not sure about the audience, ask the user for the audience.
    9. If you are not sure about the web search, ask the user if they want to add any web search.

    CONVERSATION HISTORY:
    ${this.context.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
     

    CURRENT STATE OF THE DATA SO FAR COLLECTED:
    - Topic: ${topic}
    - URLs: ${(urls?.length ?? 0) > 0 ? urls!.join(', ') : 'None'}
    - Image URLs: ${(imageUrls?.length ?? 0) > 0 ? imageUrls!.join(', ') : 'None'}
    - Audience: ${audience}
    - Style: ${style}
    - WebSearch: ${webSearch}
    - User Provided Content: ${userProvidedContent}

    FOR ACTIONS:
    - UPDATE_DATA: return this action if you have extracted information from the user's message
    - ASK_FOR_MORE: return this action if the user's message is empty or unclear
    - CONFIRM: return this action after you have extracted all the information from the user's message and the user has confirmed the data
    

     
    Look at the current state of the data so far collected and the conversation history and understand the user's request and extract information or engage in conversation with the user to gather more information, and then update and return the data in the following format: 
    {
      "action": "UPDATE_DATA || ASK_FOR_MORE || CONFIRM",
      "message": "string",
      "data": {
        "topic": "string",
        "content": "string",
        "urls": ["string"],
        "imageUrls": ["string"],
        "audience": "string",
        "style": "string",
        "webSearch": "boolean"
      }
    }
    User's last message: "${userInput}"
    `
  }

  protected async callLLM(prompt: string): Promise<string> {
    // Use structured output to ensure proper JSON formatting
    const structuredModel = this.model.withStructuredOutput(DataCollectionActionSchema);

    const result = await structuredModel.invoke([
      new SystemMessage('Now introduce yourself as a data collection agent and ask the user for the topic, urls, content, image urls, style, audience, and web search'),
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
      if (validatedResponse.data?.topic) {
        updates.topic = validatedResponse.data.topic;
      }

      if (validatedResponse.data?.content) {
        updates.userProvidedContent = validatedResponse.data.content;
      }

      if (validatedResponse.data?.urls && validatedResponse.data.urls.length > 0) {
        // Merge with existing URLs
        const currentUrls = new Set(this.context.data.urls || []);
        validatedResponse.data.urls.forEach(url => currentUrls.add(url));
        updates.urls = Array.from(currentUrls);
      }

      if (validatedResponse.data?.imageUrls && validatedResponse.data.imageUrls.length > 0) {
        const currentImageUrls = new Set(this.context.data.imageUrls || []);
        validatedResponse.data.imageUrls.forEach(url => currentImageUrls.add(url));
        updates.imageUrls = Array.from(currentImageUrls);
      }

      if (validatedResponse.data?.style) {
        updates.style = validatedResponse.data.style;
      }

      if (validatedResponse.data?.audience) {
        updates.audience = validatedResponse.data.audience;
      }

      if (typeof validatedResponse.data?.webSearch === 'boolean') {
        updates.webSearch = validatedResponse.data.webSearch;
      }

      return {
        content: validatedResponse.message,
        metadata: {
          action: validatedResponse.action,
          updates,
          data: validatedResponse.data
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
