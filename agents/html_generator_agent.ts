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
      temperature: 0.7,
      model: "claude-3-5-sonnet-20241022",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      maxRetries: 3,
      maxTokens: 8192,
    });
  }

  private getBrandThemeInstructions(): string {
    if (!this.brandTheme) return '';

    return `
BRAND THEME REQUIREMENTS:
Colors:
- Primary: ${this.brandTheme.primaryColor}
- Secondary: ${this.brandTheme.secondaryColor}
- Accent: ${this.brandTheme.accentColor}
- Text: ${this.brandTheme.textColor}
- Background: ${this.brandTheme.backgroundColor}
${this.brandTheme.logoUrl ? `- Logo: ${this.brandTheme.logoUrl}` : ''}

Footer Links (all open in new tabs):
- Website: ${this.brandTheme.websiteUrl}
- Unsubscribe: ${this.brandTheme.unsubscribeUrl}
- Social Media: ${JSON.stringify(this.brandTheme.socialMediaUrls, null, 2)}

Brand Implementation:
1. Use exact brand colors as specified above
2. Apply colors consistently throughout the design
3. Use brand font family if provided
4. Place logo in header if provided`;
  }

  private getContentSection(): string {
    const { generatedContent, style, topic, urls } = this.context.data;
    const parsedContent = generatedContent ? JSON.stringify(generatedContent) : [];
    const parsedUrls = urls ? JSON.stringify(urls) : [];

    return `
NEWSLETTER CONTENT:
Topic: ${JSON.stringify(topic, null, 2)}
Content: ${JSON.stringify([parsedContent, parsedUrls], null, 2)}
Style: ${JSON.stringify(style, null, 2)}`;
  }

  protected generatePrompt(): string {
    const { generatedContent } = this.context.data;
    if (!generatedContent) {
      return 'No content provided. Please complete the previous step first.';
    }

    return `You are an expert designer. Design a professional HTML newsletter following the core requirements and the content provided.

MAIN GOAL:
- Only design a professional HTML newsletter. Do not change, exclude or add any content.

CORE REQUIREMENTS:
1. Technical Requirements
   - Use only email-safe HTML
   - All styles must be inline (no style tags or external CSS)
   - Implement table-based layout for email client compatibility
   - Ensure mobile responsiveness
   - Use web-safe fonts with appropriate fallbacks

2. Design Elements
   - Professional layout with consistent spacing
   - Clear visual hierarchy and section separation
   - Responsive image placeholders with alt text
   - Mobile-friendly call-to-action buttons
   - Statistics and numbers prominently styled
   - Charts/graphs where data visualization applies
   - All content sections must include relevant URLs

3. Email Compatibility
   - Include necessary email client meta tags
   - Ensure image dimensions are specified
   - Use VML fallbacks for background images if needed

4. Content
   - Use all the content provided as is, do not exclude any content
   - Do not add any additional content, just use the content provided
   - Do not change the content in any way, just use it as is

${this.getBrandThemeInstructions()}

${this.getContentSection()}

Return only the complete HTML code without any explanations or comments.`;
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