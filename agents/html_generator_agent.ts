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
      <brand_theme_requirements>
        <colors>
          <primary>${this.brandTheme.primaryColor}</primary>
          <secondary>${this.brandTheme.secondaryColor}</secondary>
          <accent>${this.brandTheme.accentColor}</accent>
          <text>${this.brandTheme.textColor}</text>
          <background>${this.brandTheme.backgroundColor}</background>
          ${this.brandTheme.logoUrl ? `<logo>${this.brandTheme.logoUrl}</logo>` : ''}
        </colors>

        <footer_links description="all open in new tabs">
          <website>${this.brandTheme.websiteUrl}</website>
          <unsubscribe>${this.brandTheme.unsubscribeUrl}</unsubscribe>
          <social_media>${JSON.stringify(this.brandTheme.socialMediaUrls, null, 2)}</social_media>
        </footer_links>

        <brand_implementation>
          <requirement>Use exact brand colors as specified above</requirement>
          <requirement>Apply colors consistently throughout the design</requirement>
          <requirement>Use brand font family if provided</requirement>
          <requirement>Place logo in header if provided</requirement>
        </brand_implementation>
      </brand_theme_requirements>
    `;
  }

  private getContentSection(): string {
    const { generatedContent, style, topic, urls } = this.context.data;
    const parsedContent = generatedContent ? JSON.stringify(generatedContent) : [];
    const parsedUrls = urls ? JSON.stringify(urls) : [];

    return `
      NEWSLETTER CONTENT:
        Topic: ${JSON.stringify(topic, null, 2)}
        Content: ${JSON.stringify([parsedContent, parsedUrls], null, 2)}
        Style: ${JSON.stringify(style, null, 2)}
    `;
  }

  protected generatePrompt(): string {
    const { generatedContent } = this.context.data;
    if (!generatedContent) {
      return 'No content provided. Please complete the previous step first.';
    }

    return `
    <prompt>
      <role>
        You are an expert newsletter designer known for creating modern, attention-grabbing, and highly engaging designs. Produce a visually striking professional HTML newsletter that follows the core requirements, brand guidelines, and content instructions below. Strive for a fresh, polished, and captivating look to keep readers interested from start to finish.
      </role>

      <main_goal>
        Focus solely on designing a professional HTML newsletter that captivates. Use the provided content as is and do not change, exclude, or add any content beyond what is provided.
      </main_goal>

      <core_requirements>
        <technical_requirements>
          <requirement>Use only email-safe HTML</requirement>
          <requirement>All styles must be inline (no style tags or external CSS)</requirement>
          <requirement>Implement table-based layout for maximum email client compatibility</requirement>
          <requirement>Ensure mobile responsiveness</requirement>
          <requirement>Use web-safe fonts with appropriate fallbacks</requirement>
          <requirement>If code and other special characters are present, use the appropriate HTML entities like code blocks</requirement>
        </technical_requirements>

        <design_elements>
          <element>Aim for a sleek, contemporary layout with consistent spacing</element>
          <element>Establish a clear visual hierarchy with well-defined sections</element>
          <element>Incorporate responsive image placeholders with alt text</element>
          <element>Include eye-catching, mobile-friendly call-to-action buttons</element>
          <element>Showcase statistics and numbers prominently</element>
          <element>Integrate charts/graphs for data visualization where appropriate</element>
          <element>Include all relevant URLs within content sections</element>
          <element>Include hightlighted content in a different color and eye catching if needed</element>
          <element>Use font size of 16px to 18px for the content</element>
        </design_elements>

        <email_compatibility>
          <requirement>Add necessary email client meta tags</requirement>
          <requirement>Specify dimensions for all images</requirement>
          <requirement>Where needed, include VML fallbacks for background images</requirement>
        </email_compatibility>

        <content_requirements>
          <requirement>Use all the provided content without omission</requirement>
          <requirement>Do not add any new content beyond what is given</requirement>
          <requirement>Preserve the wording of the content as provided</requirement>
        </content_requirements>
      </core_requirements>

      <brand_theme>
        ${this.getBrandThemeInstructions()}
      </brand_theme>

      <newsletter_content>
        ${this.getContentSection()}
      </newsletter_content>

      <output_instructions>
        Return only the complete HTML code without any explanations or comments.
      </output_instructions>
    </prompt>
  `;
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