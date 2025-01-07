import { BaseAgent } from './base_agent';
import { AgentContext, AgentResponse } from './types';
import { ChatAnthropic } from '@langchain/anthropic';
import { z } from 'zod';

const SendPreparationSchema = z.object({
  action: z.enum(['UPDATE_SENDER', 'UPDATE_SUBJECT', 'UPDATE_EMAIL', 'CONFIRM']),
  data: z.object({
    senderName: z.string().optional().nullable(),
    subject: z.string().optional().nullable(),
    fromEmail: z.string().optional().nullable(),
  }),
  message: z.string()
});

export class SendPreparationAgent extends BaseAgent {
  private model: ChatAnthropic;

  constructor(context: AgentContext) {
    super(context);
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not found');
    }

    this.model = new ChatAnthropic({
      temperature: 0.7,
      model: "claude-3-sonnet-20240229",
      apiKey: apiKey,
      maxRetries: 3,
    });
  }

  protected async executePrompt(prompt: string): Promise<string> {
    const response = await this.model.invoke([
      { role: 'user', content: prompt }
    ]);
    return typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);
  }

  protected generatePrompt(userInput: string): string {
    const { generatedContent, senderName, subject, fromEmail } = this.context.data;
    const content = generatedContent ? JSON.parse(generatedContent) : null;

    return `
    <prompt>
      <role>
        You are an AI assistant helping to prepare a newsletter for sending.
      </role>

      <current_state>
        <topic>${content?.header?.title || 'Not available'}</topic>
        <sender_name>${senderName || 'Not set'}</sender_name>
        <subject_line>${subject || 'Not set'}</subject_line>
        <from_email>${fromEmail || 'Not set'}</from_email>
      </current_state>

      <user_input>
        ${userInput}
      </user_input>

      <available_actions>
        <action>Update the sender name</action>
        <action>Update the subject line</action>
        <action>Update the from email</action>
        <action>Confirm current settings</action>
      </available_actions>

      <requirements>
        <rule>If no sender/subject/email is set, suggest appropriate ones based on the newsletter content</rule>
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

  protected async processResponse(response: string): Promise<AgentResponse> {
    try {
      const parsedResponse = JSON.parse(response);
      const validatedResponse = SendPreparationSchema.parse(parsedResponse);

      const updates = {
        senderName: validatedResponse.data.senderName ?? this.context.data.senderName ?? null,
        subject: validatedResponse.data.subject ?? this.context.data.subject ?? null,
        fromEmail: validatedResponse.data.fromEmail ?? this.context.data.fromEmail ?? null
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
}