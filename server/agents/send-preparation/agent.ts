import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { BaseServerAgent } from '../base/base-agent';
import { AgentContext, AgentResponse, AgentConfig, AgentCapability } from '../base/types';

const SendPreparationSchema = z.object({
  action: z.enum(['UPDATE_SENDER', 'UPDATE_SUBJECT', 'UPDATE_EMAIL', 'CONFIRM']),
  data: z.object({
    senderName: z.string().optional().nullable(),
    subject: z.string().optional().nullable(),
    fromEmail: z.string().optional().nullable(),
    replyToEmail: z.string().optional().nullable(),
  }),
  message: z.string()
});

export class SendPreparationServerAgent extends BaseServerAgent {
  private model: ChatOpenAI;
  private config: AgentConfig;

  constructor(context: AgentContext, config: AgentConfig = {}) {
    super(context);
    this.config = config;

    // Use server-side environment variables
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
    const { generatedContent, senderName, subject, fromEmail } = this.context.data;
    const replyToEmail = (this.context.data as any).replyToEmail;
    const content = generatedContent ? JSON.parse(generatedContent) : null;

    return `
    <prompt>
      <role>
        You are an AI assistant helping to prepare an email for sending.
        Your task is to help the user set up the sender details, subject line, and email addresses.
      </role>

      <context>
        Current settings:
        - Sender Name: ${senderName || 'Not set'}
        - Subject: ${subject || 'Not set'}
        - From Email: ${fromEmail || 'Not set'}
        - Reply-To Email: ${replyToEmail || 'Not set (will use From Email)'}
      </context>

      <user_input>
        ${userInput || ''}
      </user_input>

      <available_actions>
        <action>Update the sender name</action>
        <action>Update the subject line</action>
        <action>Update the from email</action>
        <action>Confirm current settings</action>
      </available_actions>

      <requirements>
        <rule>If no sender/subject/email is set, suggest appropriate ones based on the email content</rule>
        <rule>If the user mentions a name, update senderName</rule>
        <rule>If the user mentions a subject, update subject</rule>
        <rule>If the user mentions an email, update fromEmail</rule>
        <rule>Always include all three fields in the response, even if null</rule>
        <rule>Preserve existing values for fields not being updated</rule>
        <rule>Return clear confirmation messages about what was updated</rule>
      </requirements>

      <response_format>
        <description>Respond in JSON format with:</description>
        <schema>
        {
          "action": "UPDATE_SENDER" | "UPDATE_SUBJECT" | "UPDATE_EMAIL" | "CONFIRM",
          "data": {
            "senderName": string | null,
            "subject": string | null,
            "fromEmail": string | null
          },
          "message": "Your response message to the user"
        }
        </schema>
      </response_format>
    </prompt>`;
  }

  protected async callLLM(prompt: string): Promise<string> {
    const response = await this.model.invoke([
      { role: 'user', content: prompt }
    ]);
    return typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);
  }

  protected processResponse(response: string): AgentResponse {
    try {
      const parsedResponse = JSON.parse(response);
      const validatedResponse = SendPreparationSchema.parse(parsedResponse);

      const senderName = validatedResponse.data.senderName ?? this.context.data.senderName;
      const generatedEmail = senderName
        ? `${senderName.toLowerCase().replace(/\s+/g, '')}@sendlines.com`
        : this.context.data.fromEmail;

      const updates = {
        senderName: senderName ?? null,
        subject: validatedResponse.data.subject ?? this.context.data.subject ?? null,
        fromEmail: generatedEmail ?? null
      };

      return {
        content: validatedResponse.message,
        metadata: {
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
      console.error('Send preparation agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  public getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'send_preparation',
        description: 'Prepare email sending details including sender info and subject',
        inputSchema: SendPreparationSchema,
        outputSchema: SendPreparationSchema
      }
    ];
  }
}
