import { BaseAgent } from '../base_agent';
import { AgentContext, AgentResponse } from '../types';
import { ChatAnthropic } from '@langchain/anthropic';
import { BrandTheme } from '@/types/BrandTheme';

export class MarketingHtmlGeneratorAgent extends BaseAgent {
  private model: ChatAnthropic;
  protected brandTheme: BrandTheme | null;

  constructor(context: AgentContext, brandTheme: BrandTheme | null) {
    super(context);
    this.brandTheme = brandTheme;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not found');
    }
    this.model = new ChatAnthropic({
      model: "claude-sonnet-4-20250514",
      apiKey: apiKey,
      maxRetries: 3,
      topP: 1
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
        You are an expert marketing email designer known for creating high-converting, visually striking designs that drive action. You will be given content of an email and your job is to put them into an html email. Produce a professional HTML marketing email that follows the core requirements, brand guidelines, and content instructions below. Focus on creating a design that guides readers towards the main call-to-action.
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
        Return only the complete HTML code without any explanations, comments, or markdown formatting. 
        Do not wrap the HTML in code blocks or JSON. Return the raw HTML directly.
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

  private isValidHTML(html: string): boolean {
    // Basic HTML validation checks
    if (!html || html.trim().length === 0) return false;

    // Check for basic HTML structure
    const hasHtmlTag = /<html[^>]*>/i.test(html);
    const hasBodyTag = /<body[^>]*>/i.test(html);
    const hasHeadTag = /<head[^>]*>/i.test(html);

    // At minimum should have some HTML tags
    const hasAnyHtmlTags = /<[^>]+>/g.test(html);

    // Check for email-specific elements (tables, inline styles)
    const hasEmailStructure = /<table[^>]*>/i.test(html) || /<div[^>]*style/i.test(html);

    return hasAnyHtmlTags && (hasEmailStructure || (hasHtmlTag && hasBodyTag && hasHeadTag));
  }

  private sanitizeAndValidateHTML(rawContent: string): string {
    // Extract HTML content from various wrapper formats
    let htmlContent = rawContent.trim();

    // Remove markdown code blocks
    htmlContent = htmlContent.replace(/```(?:html)?\n?/gi, '').trim();

    // Try to extract from JSON wrapper
    try {
      const parsed = JSON.parse(htmlContent);
      if (parsed.html && typeof parsed.html === 'string') {
        htmlContent = parsed.html;
      }
    } catch {
      // Not JSON, continue with current content
    }

    // Remove any explanatory text before/after HTML
    const htmlMatch = htmlContent.match(/<!DOCTYPE[\s\S]*?<\/html>/i) ||
      htmlContent.match(/<html[\s\S]*?<\/html>/i);

    if (htmlMatch) {
      htmlContent = htmlMatch[0];
    }

    return htmlContent.trim();
  }

  private generateSimpleFallbackHTML(): string {
    const { generatedContent } = this.context.data;

    if (!generatedContent) {
      return '<p>No content available</p>';
    }

    const content = Array.isArray(generatedContent) ? generatedContent.join('\n') : String(generatedContent);
    const primaryColor = this.brandTheme?.primaryColor || '#007bff';
    const backgroundColor = this.brandTheme?.backgroundColor || '#ffffff';
    const textColor = this.brandTheme?.textColor || '#333333';

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor};">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 20px 0 30px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
          <tr>
            <td align="center" bgcolor="${primaryColor}" style="padding: 40px 0 30px 0; color: #ffffff; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif;">
              ${this.brandTheme?.name || 'Newsletter'}
            </td>
          </tr>
          <tr>
            <td bgcolor="${backgroundColor}" style="padding: 40px 30px 40px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: ${textColor}; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">
                    ${content.replace(/\n/g, '<br>')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="#ee4c50" style="padding: 30px 30px 30px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">
                    &copy; ${new Date().getFullYear()} ${this.brandTheme?.name || 'Company'}<br/>
                    ${this.brandTheme?.unsubscribeUrl ? `<a href="${this.brandTheme.unsubscribeUrl}" style="color: #ffffff;">Unsubscribe</a>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
  }

  public async execute(): Promise<AgentResponse> {
    const maxRetries = 2;
    let lastError: string | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const prompt = this.generatePrompt();

        // Use direct model invocation instead of structured output
        const response = await this.model.invoke([
          { role: 'user', content: prompt }
        ]);

        // Extract and validate HTML content from the response
        const rawContent = response.content as string;
        const htmlContent = this.sanitizeAndValidateHTML(rawContent);

        // Validate the HTML quality
        if (!this.isValidHTML(htmlContent)) {
          const errorMsg = `Invalid HTML generated on attempt ${attempt + 1}. Content length: ${htmlContent.length}`;
          console.warn(errorMsg);
          lastError = errorMsg;

          if (attempt < maxRetries) {
            // Add more specific instructions for retry
            continue;
          }

          // Return the content anyway if it's the last attempt
          console.warn('Returning potentially invalid HTML after max retries');
        }

        // Additional validation: ensure minimum content requirements
        if (htmlContent.length < 100) {
          const errorMsg = `HTML content too short (${htmlContent.length} chars) on attempt ${attempt + 1}`;
          console.warn(errorMsg);
          lastError = errorMsg;

          if (attempt < maxRetries) continue;
        }

        console.log(`Successfully generated HTML email on attempt ${attempt + 1}`);
        return this.processResponse({ html: htmlContent });

      } catch (error) {
        const errorMsg = `Attempt ${attempt + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('Marketing HTML generator agent execution error:', errorMsg);
        lastError = errorMsg;

        if (attempt < maxRetries) {
          continue;
        }
      }
    }

    // If we get here, all attempts failed - use fallback
    console.warn('All AI generation attempts failed, using fallback HTML template');
    const fallbackHTML = this.generateSimpleFallbackHTML();

    return {
      content: fallbackHTML,
      metadata: {
        type: 'html_content',
        fallback_used: true,
        last_error: lastError
      }
    };
  }
} 