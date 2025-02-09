import { BaseAgent } from '../base_agent';
import { AgentContext, AgentResponse } from '../types';
import { ChatOpenAI } from '@langchain/openai';
import { z } from "zod";

// Define the schema for marketing email sections
const marketingEmailSchema = z.object({
  header: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
  }),
  sections: z.union([
    z.array(z.object({
      title: z.string(),
      content: z.string(),
      url: z.string(),
      image: z.string().nullable().optional(),
      callToAction: z.object({
        text: z.string(),
        url: z.string(),
      }).optional(),
    })),
    z.string().transform((str) => {
      try {
        const parsed = JSON.parse(str);
        if (!Array.isArray(parsed)) {
          throw new Error('Parsed value is not an array');
        }
        return parsed;
      } catch (e) {
        throw new Error('Failed to parse sections string');
      }
    })
  ]),
  footer: z.object({
    content: z.string(),
    callToAction: z.string().optional(),
  })
});

export class MarketingContentDrafterAgent extends BaseAgent {
  private model: ChatOpenAI;

  constructor(context: AgentContext) {
    super(context);
    this.model = new ChatOpenAI({
      // temperature: 0.3,
      model: "o3-mini",
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      reasoningEffort: "medium",
      // maxRetries: 3,
      // maxTokens: 8192,
    });
  }

  private async generateWebContent(): Promise<any | null> {
    if (!this.context.data.webSearchContent?.length) return null;

    const prompt = `
    <prompt>
      <role>
        You are a professional marketing email copywriter known for creating compelling, action-driven content that converts. Your task is to create a structured marketing email about "${this.context.data.topic}".
      </role>

      <task>
        Use ONLY the information provided in the following sources:
      </task>

      <source_data>
        ${this.context.data.webSearchContent.map((result, index) => `
        <source id="${index + 1}">
          <title>${result.title}</title>
          <content>${result.content}</content>
          <url>${result.url}</url>
        </source>`).join('\n')}
      </source_data>

      <response_format>
        <description>Provide a JSON object with exactly these fields:</description>
        <schema>
        {
          "header": {
            "title": "attention-grabbing headline",
            "subtitle": "compelling subheadline"
          },
          "sections": [
            {
              "title": "section title",
              "content": "persuasive content",
              "url": "source url",
              "image": "image url if available",
              "callToAction": {
                "text": "compelling CTA text",
                "url": "target URL"
              }
            }
          ],
          "footer": {
            "content": "final persuasive message",
            "callToAction": "main call to action"
          }
        }
        </schema>
      </response_format>

      <requirements>
        <section_count>Include all the information provided in the sources</section_count>
        
        <section_rules>
          <rule>Each section should build towards the main call to action</rule>
          <rule>Use persuasive language that drives action</rule>
          <rule>Include clear value propositions</rule>
          <rule>Focus on benefits over features</rule>
          <rule>Include the source URL if available</rule>
        </section_rules>

        <restrictions>
          <rule>Do not add information not in the sources</rule>
          <rule>Do not remove details</rule>
          <rule>Keep the tone professional but persuasive</rule>
        </restrictions>

        <data_preservation>
          Raw numbers, statistics, and technical details must be preserved exactly and designed into graphs and charts if possible.
        </data_preservation>
      </requirements>

      <output_instructions>
        Return direct JSON without additional formatting or explanation. The response must be valid JSON that matches the schema exactly. Do not include any text outside the JSON structure.
      </output_instructions>
    </prompt>`;

    const structuredModel = this.model.withStructuredOutput(marketingEmailSchema);
    const result = await structuredModel.invoke([
      { role: 'user', content: prompt }
    ]);

    if (result && typeof result.sections === 'string') {
      try {
        result.sections = JSON.parse(result.sections);
      } catch (e) {
        console.error('Failed to parse sections:', e);
        throw new Error('Invalid sections format in response');
      }
    }

    return result;
  }

  private async generateUserContent(): Promise<any | null> {
    if (!this.context.data.userProvidedContent?.trim()) return null;

    const prompt = `
    <prompt>
      <role>
        You are a professional marketing email copywriter tasked with creating compelling, action-driven content from user-provided information about "${this.context.data.topic}". Focus on converting readers into taking the desired action.
      </role>

      <input_content>
        <user_content>
          ${this.context.data.userProvidedContent}
        </user_content>

        ${this.context.data.urls?.length ? `
        <reference_urls_content>
          ${this.context.data.urlsExtractedContent.map((content, index) => `
            <url_content>
              <url>${this.context.data.urls[index]}</url>
              <extracted_content>${content}</extracted_content>
            </url_content>
          `).join('\n')}
        </reference_urls_content>` : ''}

        ${this.context.data.style ? `
        <style_guide>
          ${this.context.data.style}
        </style_guide>` : ''}
      </input_content>

      <response_format>
        <description>Provide a JSON object with exactly these fields:</description>
        <schema>
        {
          "header": {
            "title": "attention-grabbing headline",
            "subtitle": "compelling subheadline"
          },
          "sections": [
            {
              "title": "section title",
              "content": "persuasive content",
              "url": "reference url if provided",
              "image": "image url if provided",
              "callToAction": {
                "text": "compelling CTA text",
                "url": "target URL"
              }
            }
          ],
          "footer": {
            "content": "final persuasive message",
            "callToAction": "main call to action"
          }
        }
        </schema>
      </response_format>

      <requirements>
        <section_count>Create 2-3 focused sections that build towards the main CTA</section_count>

        <content_rules>
          <rule>Use persuasive, action-oriented language</rule>
          <rule>Focus on benefits and value propositions</rule>
          <rule>Include social proof when available</rule>
          <rule>Make each section drive towards the main call to action</rule>
          <rule>Keep the tone professional but compelling</rule>
        </content_rules>

        <restrictions>
          <rule>Do not add new information beyond the provided content</rule>
          <rule>Do not remove or alter key details</rule>
          <rule>Preserve technical accuracy</rule>
        </restrictions>

        <strict_preservation>
          <item>All numbers and statistics</item>
          <item>Technical details and specifications</item>
          <item>Product features</item>
          <item>Pricing information</item>
        </strict_preservation>
      </requirements>

      <output_instructions>
        Return direct JSON without additional formatting or explanation. The response must be valid JSON that matches the schema exactly. Do not include any text outside the JSON structure.
      </output_instructions>
    </prompt>`;

    const structuredModel = this.model.withStructuredOutput(marketingEmailSchema);
    const result = await structuredModel.invoke([
      { role: 'user', content: prompt }
    ]);

    if (result && typeof result.sections === 'string') {
      try {
        result.sections = JSON.parse(result.sections);
      } catch (e) {
        console.error('Failed to parse sections:', e);
        throw new Error('Invalid sections format in response');
      }
    }
    return result;
  }

  private async generateUrlContent(): Promise<any | null> {
    if (!this.context.data.urlsExtractedContent?.length) return null;

    const prompt = `
    <prompt>
      <role>
        You are a professional marketing email copywriter tasked with creating compelling, action-driven content from extracted URL content about "${this.context.data.topic}".
      </role>

      <extracted_content>
        ${this.context.data.urlsExtractedContent.map((content, index) => `
        <url_content>
          <url>${this.context.data.urls[index]}</url>
          <content>${content}</content>
        </url_content>`).join('\n')}
      </extracted_content>

      ${this.context.data.style ? `
      <style_guide>
        ${this.context.data.style}
      </style_guide>` : ''}

      <response_format>
        ${this.getResponseFormat()}
      </response_format>
    </prompt>`;

    const structuredModel = this.model.withStructuredOutput(marketingEmailSchema);
    return await structuredModel.invoke([
      { role: 'user', content: prompt }
    ]);
  }

  private mergeContent(webContent: any | null, userContent: any | null): any {
    if (!webContent && !userContent) {
      throw new Error('No content generated from either source');
    }

    if (!webContent) return userContent;
    if (!userContent) return webContent;

    return {
      header: {
        title: `${webContent.header.title} - ${userContent.header.title}`,
        subtitle: webContent.header.subtitle || userContent.header.subtitle,
      },
      sections: [
        ...webContent.sections,
        ...userContent.sections,
      ],
      footer: {
        content: `${webContent.footer.content}\n\n${userContent.footer.content}`,
        callToAction: webContent.footer.callToAction || userContent.footer.callToAction,
      }
    };
  }

  public async execute(): Promise<AgentResponse> {
    try {
      const hasWebContent = this.context.data.webSearchContent?.length > 0;
      const hasUserContent = this.context.data.userProvidedContent?.trim().length > 0;
      const hasUrlContent = this.context.data.urlsExtractedContent?.length > 0;

      if (!hasWebContent && !hasUserContent && !hasUrlContent) {
        throw new Error('No input content provided');
      }

      // Generate content from each available source
      const contentPromises: Promise<any | null>[] = [];

      if (hasWebContent) {
        contentPromises.push(this.generateWebContent());
      }

      if (hasUserContent) {
        contentPromises.push(this.generateUserContent());
      }

      if (hasUrlContent) {
        contentPromises.push(this.generateUrlContent());
      }

      const contents = await Promise.all(contentPromises);
      const validContents = contents.filter(content => content !== null);

      if (validContents.length === 0) {
        throw new Error('Failed to generate content from any source');
      }

      // Merge all valid contents
      const mergedContent = validContents.reduce((acc, curr) => this.mergeContent(acc, curr));

      return {
        content: JSON.stringify(mergedContent),
        metadata: {
          type: 'draft_content',
          sections: mergedContent,
          sourceTypes: {
            web: hasWebContent,
            user: hasUserContent,
            url: hasUrlContent
          }
        }
      };
    } catch (error) {
      console.error('Marketing content drafter agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  protected generatePrompt(): string {
    // This method won't be used since we're using direct model invocation
    return '';
  }

  protected processResponse(response: string): AgentResponse {
    // This method won't be used since we're using structured output
    return {
      content: response,
      metadata: {
        type: 'draft_content'
      }
    };
  }

  private getResponseFormat(): string {
    return `
      <description>Provide a JSON object with exactly these fields:</description>
      <schema>
      {
        "header": {
          "title": "attention-grabbing headline",
          "subtitle": "compelling subheadline"
        },
        "sections": [
          {
            "title": "section title",
            "content": "persuasive content",
            "url": "source url",
            "image": "image url if available",
            "callToAction": {
              "text": "compelling CTA text",
              "url": "target URL"
            }
          }
        ],
        "footer": {
          "content": "final persuasive message",
          "callToAction": "main call to action"
        }
      }
      </schema>
    `;
  }
} 