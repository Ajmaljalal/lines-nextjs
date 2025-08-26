import { AgentContext, AgentResponse, BrandTheme, IAgent, AgentInput, AgentOutput, AgentCapability } from './types';

export abstract class BaseServerAgent implements IAgent {
  protected context: AgentContext;
  protected brandTheme: BrandTheme | null;

  constructor(context: AgentContext) {
    this.context = context;
    this.brandTheme = context.brandTheme || null;
  }

  protected getBrandThemeInstructions(): string {
    if (!this.brandTheme) return '';

    return `
      <brand_theme_requirements>
        <colors>
          <primary>${this.brandTheme.primaryColor}</primary>
          <secondary>${this.brandTheme.secondaryColor}</secondary>
          <accent>${this.brandTheme.accentColor}</accent>
          <text>${this.brandTheme.textColor}</text>
          <background>${this.brandTheme.backgroundColor}</background>
          ${this.brandTheme.logoUrl ? `<logo>${this.brandTheme.logoUrl}</logo>` : ''}
        </colors>
        <footer_links>
          <website>${this.brandTheme.websiteUrl || ''}</website>
          <unsubscribe>${this.brandTheme.unsubscribeUrl || ''}</unsubscribe>
          <social_media>${JSON.stringify(this.brandTheme.socialMediaUrls || {}, null, 2)}</social_media>
        </footer_links>
      </brand_theme_requirements>
    `;
  }

  protected abstract generatePrompt(userInput?: string): string;
  protected abstract processResponse(response: string): AgentResponse;

  public async execute(input: AgentInput): Promise<AgentOutput> {
    try {
      // Update context with input data
      this.context.data = { ...this.context.data, ...input.data };
      if (input.brandTheme) {
        this.brandTheme = input.brandTheme;
        this.context.brandTheme = input.brandTheme;
      }
      if (input.messages) {
        this.context.messages = [...this.context.messages, ...input.messages];
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
      console.error('Server agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  protected abstract callLLM(prompt: string): Promise<string>;

  public abstract getCapabilities(): AgentCapability[];
}
