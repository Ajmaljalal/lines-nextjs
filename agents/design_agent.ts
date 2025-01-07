import { BaseAgent } from './base';
import { AgentContext, AgentResponse } from './types';
import { ChatAnthropic } from '@langchain/anthropic';
import { z } from "zod";
import { BrandTheme } from '@/types/BrandTheme';

const designResponseSchema = z.object({
  action: z.enum(['update_layout', 'update_colors', 'update_typography', 'update_spacing', 'validate_design']),
  updates: z.object({
    css: z.string().optional(),
    html: z.string().optional(),
  }).optional(),
  message: z.string(),
});

export class DesignAgent extends BaseAgent {
  private model: ChatAnthropic;
  private brandTheme: BrandTheme | null;

  constructor(context: AgentContext, brandTheme: BrandTheme | null) {
    super(context);
    this.brandTheme = brandTheme;
    this.model = new ChatAnthropic({
      temperature: 0.7,
      model: "claude-3-sonnet-20240229",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      maxRetries: 3,
    });
  }

  protected generatePrompt(): string {
    const { htmlContent, style } = this.context.data;

    return `
    <prompt>
      <role>
        You are an AI assistant helping users customize their newsletter design. You can help them:
        1. Update the layout
        2. Modify colors and branding
        3. Adjust typography
        4. Fine-tune spacing and alignment
        5. Validate design consistency
      </role>

      <current_state>
        <html_content>${htmlContent || 'Not generated yet'}</html_content>
        <style_preferences>${style || 'Not specified'}</style_preferences>
        <brand_theme>${JSON.stringify(this.brandTheme, null, 2)}</brand_theme>
      </current_state>

      <task>
        Help the user improve their newsletter design. If they want to change the layout,
        help them adjust it. If they want to modify colors or typography, guide them through it.
        Ensure all changes maintain email client compatibility and responsive design.
      </task>

      <response_format>
        Return a JSON object with:
        - action: The type of action to take (update_layout, update_colors, update_typography, update_spacing, validate_design)
        - updates: The design updates (if applicable)
          - css: CSS changes
          - html: HTML changes
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
        type: 'design_customization',
        action: response.action,
        updates: response.updates
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
      const structuredModel = this.model.withStructuredOutput(designResponseSchema);
      const response = await structuredModel.invoke([
        { role: 'user', content: prompt }
      ]);

      this.context.messages.push({
        role: 'assistant',
        content: response.message
      });

      return this.processResponse(response);
    } catch (error) {
      console.error('Design agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 