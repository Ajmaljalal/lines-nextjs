import { BaseAgent } from './base_agent';
import { AgentContext, AgentResponse } from './types';
import { ChatAnthropic } from '@langchain/anthropic';
import { z } from "zod";
import { BrandTheme } from '@/types/BrandTheme';
// import { ChatOpenAI } from '@langchain/openai';
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

  constructor(context: AgentContext, brandTheme: BrandTheme | null) {
    super(context);
    this.brandTheme = brandTheme;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not found');
    }

    this.model = new ChatAnthropic({
      temperature: 0.5,
      model: "claude-3-5-sonnet-20241022",
      apiKey: apiKey,
      maxRetries: 3,
      maxTokens: 8192,
      // reasoningEffort: "medium",

      // maxCompletionTokens: 8192,
    });
  }

  protected generatePrompt(userInput?: string): string {
    const { htmlContent } = this.context.data;
    if (!htmlContent) {
      return 'No HTML content available. Please generate the content first.';
    }

    return `
    <prompt>
      <role>
        You are an expert HTML email designer. Help update the email design based on the user requests.
      </role>

      <current_html>
        ${htmlContent}
      </current_html>

      <user_request>
        ${userInput || ''}
      </user_request>

      ${this.brandTheme ? `
      <brand_theme>
        ${JSON.stringify(this.brandTheme, null, 2)}
      </brand_theme>
      ` : ''}

      <task>
        Update the email HTML based on the user's request.
        Return the complete updated HTML while maintaining email compatibility.
        Only modify the specific elements mentioned in the user request.
      </task>

      <output_instructions>
        Return only the complete HTML code without any explanations or comments.
      </output_instructions>
    </prompt>`;
  }

  protected processResponse(response: any): AgentResponse {
    return {
      content: 'Design updated successfully',
      metadata: {
        type: 'design_update',
        updates: {
          htmlContent: response.html
        }
      }
    };
  }

  public async execute(input?: string): Promise<AgentResponse> {
    try {
      if (!input) return { content: '', error: 'No input provided' };

      const prompt = this.generatePrompt(input);

      const designSchema = z.object({
        html: z.string()
      });

      const structuredModel = this.model.withStructuredOutput(designSchema);
      const response = await structuredModel.invoke([
        { role: 'user', content: prompt }
      ]);

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