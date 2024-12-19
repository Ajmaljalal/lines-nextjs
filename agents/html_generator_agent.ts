import { BaseAgent } from './base';
import { AgentContext, AgentResponse } from './types';
import { ChatAnthropic } from '@langchain/anthropic';
import { z } from "zod";

const newsletterHtmlSchema = z.object({
  html: z.string()
});

export class HtmlGeneratorAgent extends BaseAgent {
  private model: ChatAnthropic;

  constructor(context: AgentContext) {
    super(context);
    this.model = new ChatAnthropic({
      temperature: 0.3, // Lower temperature for more consistent HTML output
      model: "claude-3-5-sonnet-20241022",
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
    });
  }

  protected generatePrompt(): string {
    const { content, style, topic, urls } = this.context.data;
    const generatedContent = JSON.parse(content || '');

    return `Generate a beautiful, modern HTML email newsletter using the following [topic] [content], [style], and [urls]. 
    The design should be mobile-responsive and use modern email-safe HTML and inline CSS.

    Include the following design elements:
    - A clean, professional layout with appropriate spacing
    - Email-safe web fonts or fallback system fonts
    - A color scheme that's professional and engaging
    - Responsive images placeholders where appropriate
    - Clear hierarchy and section separation
    - Mobile-friendly buttons for call-to-action elements
    - inline styling only

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