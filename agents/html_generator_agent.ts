import { BaseAgent } from './base';
import { AgentContext, AgentResponse } from './types';
import { ChatGroq } from '@langchain/groq';
import { z } from "zod";

const newsletterHtmlSchema = z.object({
  html: z.string()
});

export class HtmlGeneratorAgent extends BaseAgent {
  private model: ChatGroq;

  constructor(context: AgentContext) {
    super(context);
    this.model = new ChatGroq({
      temperature: 0.5, // Lower temperature for more consistent HTML output
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY
    });
  }

  protected generatePrompt(): string {
    const { generatedContent } = this.context.data;
    const content = JSON.parse(generatedContent || '');

    return `Generate a beautiful, modern HTML email newsletter using the following content. 
    The design should be mobile-responsive and use modern email-safe HTML and inline CSS.

    Include the following design elements:
    - A clean, professional layout with appropriate spacing
    - Email-safe web fonts or fallback system fonts
    - A color scheme that's professional and engaging
    - Responsive images placeholders where appropriate
    - Clear hierarchy and section separation
    - Mobile-friendly buttons for call-to-action elements

    Content to format:
    ${JSON.stringify(content, null, 2)}

    Requirements:
    - Use only email-safe HTML and inline CSS
    - Ensure all styles are inline (no <style> tags)
    - Use table-based layout for email compatibility
    - Include media queries for mobile responsiveness
    - Use web-safe fonts or appropriate fallbacks
    - Optimize for dark mode compatibility
    
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