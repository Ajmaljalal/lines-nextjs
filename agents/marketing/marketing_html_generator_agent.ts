import { BaseAgent } from '../base_agent';
import { AgentContext, AgentResponse } from '../types';
import { ChatAnthropic } from '@langchain/anthropic';
import { z } from "zod";
import { BrandTheme } from '@/types/BrandTheme';
import { ChatOpenAI } from '@langchain/openai';
const marketingHtmlSchema = z.object({
  html: z.string()
});

export class MarketingHtmlGeneratorAgent extends BaseAgent {
  private model: ChatAnthropic;
  protected brandTheme: BrandTheme | null;

  constructor(context: AgentContext, brandTheme: BrandTheme | null) {
    super(context);
    this.brandTheme = brandTheme;
    //   this.model = new ChatAnthropic({
    //     temperature: 0.5,
    //     model: "claude-3-5-sonnet-20241022",
    //     apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    //     maxRetries: 3,
    //     maxTokens: 8192,
    //   });
    this.model = new ChatAnthropic({
      temperature: 1,
      model: "claude-3-5-sonnet-20241022",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      maxRetries: 3,
      // reasoningEffort: "medium",

      // maxCompletionTokens: 8192,
    });
  }

  protected getBrandThemeInstructions(): string {
    if (!this.brandTheme) return '';

    return `
      <brand_theme_requirements>
        <description>
          Use the following brand theme to design the html email.
        </description>
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
      </brand_theme_requirements>
    `;
  }

  private getContentSection(): string {
    const { generatedContent, style, topic, urls, urlsExtractedContent } = this.context.data;
    const parsedContent = generatedContent ? JSON.stringify(generatedContent) : [];
    const parsedUrls = urls ? JSON.stringify(urls) : [];
    const parsedExtractedContent = urlsExtractedContent ? JSON.stringify(urlsExtractedContent) : [];

    return `
      MARKETING EMAIL TEXT CONTENT:
        Topic: ${JSON.stringify(topic, null, 2)}
        Content: ${JSON.stringify([parsedContent, parsedUrls, parsedExtractedContent], null, 2)}
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
        You are an expert marketing email designer known for creating high-converting, visually striking designs that drive action. You will be given text content and your job is to put them into a html email. Produce a professional HTML marketing email that follows the core requirements, brand guidelines, and content instructions below. Focus on creating a design that guides readers towards the main call-to-action.
      </role>

      <main_goal>
        Focus solely on designing a professional HTML marketing email that converts. Use the provided content as is and do not change, exclude, or add any content.
      </main_goal>

      <core_requirements>
        <technical_requirements>
          <requirement>Use only email client compatible HTML</requirement>
          <requirement>All styles must be inline (no style tags or external CSS)</requirement>
          <requirement>Implement table-based layout for maximum email client compatibility</requirement>
          <requirement>Ensure mobile responsiveness</requirement>
          <requirement>Use web-safe fonts with appropriate fallbacks</requirement>
          <requirement>Use UTF-8 encoding characters for all content</requirement>
        </technical_requirements>

        <design_elements>
          <element>Create a clean, focused layout that guides attention to CTAs</element>
          <element>Use appropriate space between elements to improve readability</element>
          <element>Make CTAs stand out with contrasting colors and clear buttons</element>
          <element>Ensure CTAs are easily tappable on mobile (min 40px height)</element>
          <element>Use visual hierarchy to emphasize key benefits</element>
          <element>Include responsive image with alt text</element>
          <element>Use font size of 20px for body text and 24px+ for headlines</element>
          <element>Keep paragraphs short and scannable (3-4 lines max)</element>
        </design_elements>

        <email_compatibility>
          <requirement>Add necessary email client meta tags</requirement>
          <requirement>Specify dimensions for all images</requirement>
          <requirement>Where needed, include VML fallbacks for background images</requirement>
          <requirement>Ensure all content is properly formatted and within valid HTML tags</requirement>
        </email_compatibility>

        <content_requirements>
          <requirement>Use the provided textcontent completely without omission</requirement>
          <requirement>Do not add any new text content</requirement>
          <requirement>Preserve the wording of the content as provided</requirement>
          <requirement>Maintain the persuasive tone of the copy</requirement>
        </content_requirements>

        <cta_requirements>
          <requirement>Make CTAs prominent and visually distinct</requirement>
          <requirement>Use action-oriented button text</requirement>
          <requirement>Ensure sufficient padding around CTAs</requirement>
          <requirement>Use contrasting colors for maximum visibility</requirement>
        </cta_requirements>
      </core_requirements>

      <brand_theme>
        ${this.getBrandThemeInstructions()}
      </brand_theme>

      <marketing_content>
        ${this.getContentSection()}
      </marketing_content>

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

      const structuredModel = this.model.withStructuredOutput(marketingHtmlSchema);
      const response = await structuredModel.invoke([
        { role: 'user', content: prompt }
      ]);

      return this.processResponse(response);
    } catch (error) {
      console.error('Marketing HTML generator agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 