import { BaseAgent } from './base';
import { AgentContext, AgentResponse } from './types';
import { ChatAnthropic } from '@langchain/anthropic';
import { z } from "zod";
import { BrandTheme } from '@/types/BrandTheme';

const newsletterHtmlSchema = z.object({
  html: z.string()
});

export class HtmlGeneratorAgent extends BaseAgent {
  private model: ChatAnthropic;
  private brandTheme: BrandTheme | null;

  constructor(context: AgentContext, brandTheme: BrandTheme | null) {
    super(context);
    this.brandTheme = brandTheme;
    this.model = new ChatAnthropic({
      temperature: 0.5,
      model: "claude-3-5-sonnet-20241022",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      maxRetries: 3,
      maxTokens: 8000,
    });
  }

  protected generatePrompt(): string {
    const { content, style, topic, urls } = this.context.data;
    const generatedContent = JSON.parse(content || '');

    let themeInstructions = '';
    if (this.brandTheme) {
      themeInstructions = `
      Use the following brand theme for the design:
      - Primary Color: ${this.brandTheme.primaryColor}
      - Secondary Color: ${this.brandTheme.secondaryColor}
      - Accent Color: ${this.brandTheme.accentColor}
      - Text Color: ${this.brandTheme.textColor}
      - Background Color: ${this.brandTheme.backgroundColor}
      ${this.brandTheme.logoUrl ? `- Logo URL: ${this.brandTheme.logoUrl}` : ''}

      - Use the following urls (if provided) in the footer of the newsletter.
      - Make sure to open them in new tabs when clicked.
      - Website URL: ${this.brandTheme.websiteUrl}
      - Unsubscribe URL: ${this.brandTheme.unsubscribeUrl}
      - Social Media URLs: ${JSON.stringify(this.brandTheme.socialMediaUrls, null, 2)}

      Make sure to:
      1. Use these exact colors for the corresponding elements
      2. Apply the brand colors consistently throughout the design
      3. Use the specified font family if provided
      4. Include the logo in the header if provided
      `;
    }

    return `Generate a beautiful, modern HTML email newsletter using the following [topic] [content], [style], and [urls]. 
    The design should be mobile-responsive and use modern email-safe HTML and inline CSS.

    ${themeInstructions}

    Include the following design elements:
    - A clean, well-designed, pretty and professional layout with appropriate spacing
    - Email-safe web fonts or fallback system fonts
    - A color scheme that's professional and engaging based on the style provided by the user and the topic and content
    - Responsive images placeholders where appropriate
    - Clear hierarchy and section separation
    - Mobile-friendly buttons for call-to-action elements
    - inline styling only
    - if there is numbers and statistics, make sure to include them in the content section and them pretty and nicely designed and styled
    - Include charts and graphs if applicable

    Topic:
    ${JSON.stringify(topic, null, 2)}

    Content:
    ${JSON.stringify(generatedContent, null, 2)}

    URLs:
    ${JSON.stringify(urls, null, 2)}

    Style:
    ${JSON.stringify(style, null, 2)}

    Requirements:
    - Use only email-safe HTML and inline styling
    - Ensure all styles are passed as inline styles to the elements
    - Use table-based layout for email compatibility
    - Use web-safe fonts or appropriate fallbacks
    
    Return only the HTML code without any explanation.`;
  }

  protected processResponse(response: any): AgentResponse {
    return {
      content: response.html,
      metadata: {
        type: 'html_content'
      }
    };
  }

  public async execute(): Promise<AgentResponse> {
    try {
      const prompt = this.generatePrompt();

      const structuredModel = this.model.withStructuredOutput(newsletterHtmlSchema);
      const response = await structuredModel.invoke([
        { role: 'user', content: prompt }
      ]);

      return this.processResponse(response);
    } catch (error) {
      console.error('HTML generator agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 