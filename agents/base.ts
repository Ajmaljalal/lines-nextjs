import { BrandTheme } from '@/types/BrandTheme';
import { AgentContext, AgentResponse } from './types';

export abstract class BaseAgent {
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

  protected abstract generatePrompt(): string

  protected abstract processResponse(response: string): AgentResponse;

  public async execute(input?: string): Promise<AgentResponse> {
    try {
      if (input) {
        this.context.messages.push({
          role: 'user',
          content: input
        });
      }

      const prompt = this.generatePrompt();
      const response = await this.callOpenAI(prompt);

      this.context.messages.push({
        role: 'assistant',
        content: response
      });

      return this.processResponse(response);
    } catch (error) {
      console.error('Agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          ...this.context.messages,
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await response.json();
    return data.content;
  }
}
