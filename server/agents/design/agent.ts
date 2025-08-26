import { z } from 'zod';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseServerAgent } from '../base/base-agent';
import { AgentContext, AgentResponse, AgentConfig, AgentCapability, BrandTheme } from '../base/types';

const designResponseSchema = z.object({
  action: z.enum(['update_layout', 'update_colors', 'update_typography', 'update_spacing', 'validate_design']),
  updates: z.object({
    css: z.string().optional(),
    html: z.string().optional(),
  }).optional(),
  message: z.string(),
});

export class DesignServerAgent extends BaseServerAgent {
  private model: ChatAnthropic;
  private config: AgentConfig;
  protected brandTheme: BrandTheme | null;

  constructor(context: AgentContext, config: AgentConfig = {}) {
    super(context);
    this.config = config;
    this.brandTheme = context.brandTheme || null;

    // Use server-side environment variables
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not found. Please set ANTHROPIC_API_KEY in your environment variables.');
    }

    this.model = new ChatAnthropic({
      temperature: config.temperature || 0.5,
      model: config.model || "claude-3-5-sonnet-20241022",
      apiKey: apiKey,
      maxRetries: config.maxRetries || 3,
      maxTokens: 8192,
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

  protected async callLLM(prompt: string): Promise<string> {
    const designSchema = z.object({
      html: z.string()
    });

    const structuredModel = this.model.withStructuredOutput(designSchema);
    const response = await structuredModel.invoke([
      { role: 'user', content: prompt }
    ]);

    return response.html;
  }

  protected processResponse(response: string): AgentResponse {
    return {
      content: 'Design updated successfully',
      metadata: {
        type: 'design_update',
        updates: {
          htmlContent: response
        }
      }
    };
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
      console.error('Design agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  public getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'design_update',
        description: 'Update email design and layout based on user requests',
        inputSchema: designResponseSchema,
        outputSchema: designResponseSchema
      }
    ];
  }
}
