import { BaseAgent } from './base';
import { AgentContext, AgentResponse } from './types';
import { ChatOpenAI } from '@langchain/openai';
import { z } from "zod";

// Define the schema for newsletter sections
const newsletterSectionsSchema = z.object({
  header: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
  }),
  sections: z.union([
    z.array(z.object({
      title: z.string(),
      content: z.string(),
      url: z.string(),
      image: z.string().optional(),
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

export class ContentDrafterAgent extends BaseAgent {
  private model: ChatOpenAI;

  constructor(context: AgentContext) {
    super(context);
    this.model = new ChatOpenAI({
      temperature: 0.1,
      model: "gpt-4o",
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      maxRetries: 3,
      maxTokens: 8192,
    });
  }

  private async generateWebContent(): Promise<any | null> {
    if (!this.context.data.webSearchContent?.length) return null;

    const prompt = `
    <prompt>
      <role>
        You are a professional newsletter writer tasked with creating a structured newsletter about "${this.context.data.topic}".
      </role>

      <task>
        Use ONLY the information from these web search results:
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
            "title": "clear, engaging title",
            "subtitle": "optional subtitle"
          },
          "sections": [
            {
              "title": "section title",
              "content": "section content",
              "url": "source url",
              "image": "image url if available"
            }
          ],
          "footer": {
            "content": "conclusion",
            "callToAction": "optional call to action"
          }
        }
        </schema>
      </response_format>

      <requirements>
        <section_count>Create exactly 3-5 sections</section_count>
        
        <section_rules>
          <rule>Focus on a distinct aspect of the topic</rule>
          <rule>Include the source URL</rule>
          <rule>Contain all key facts from the source</rule>
          <rule>Use engaging language without altering meaning</rule>
        </section_rules>

        <restrictions>
          <rule>Do not add information not in the sources</rule>
          <rule>Do not remove important details</rule>
          <rule>Do not merge unrelated facts</rule>
        </restrictions>

        <data_preservation>
          Raw numbers, statistics, and technical details must be preserved exactly
        </data_preservation>
      </requirements>

      <output_instructions>
        Return direct JSON without additional formatting or explanation. The response must be valid JSON that matches the schema exactly. Do not include any text outside the JSON structure.
      </output_instructions>
    </prompt>`;

    const structuredModel = this.model.withStructuredOutput(newsletterSectionsSchema);
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
        You are a professional newsletter writer tasked with compiling user-provided content about "${this.context.data.topic}" into a clear newsletter format. Do not remove any information, only compile it into a newsletter format and that's it.
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
            "title": "clear, engaging title",
            "subtitle": "optional subtitle"
          },
          "sections": [
            {
              "title": "section title",
              "content": "section content",
              "url": "reference url if provided",
              "image": "image url if provided"
            }
          ],
          "footer": {
            "content": "conclusion",
            "callToAction": "optional call to action"
          }
        }
        </schema>
      </response_format>

      <requirements>
        <section_count>Compile user provided content into exactly 3-5 sections</section_count>
        <content_preservation>Keep the content as close to the original as possible</content_preservation>

        <section_rules>
          <rule>Cover a distinct aspect</rule>
          <rule>Include all provided content</rule>
          <rule>Do not remove or summarize away details</rule>
          <rule>Preserve technical accuracy</rule>
          <rule>Use provided URLs where relevant</rule>
        </section_rules>

        <restrictions>
          <rule>Do not add new information</rule>
          <rule>Do not remove or summarize away details</rule>
          <rule>Do not alter technical specifications, including code snippets and other technical details</rule>
        </restrictions>

        <strict_preservation>
          <item>All numbers and statistics</item>
          <item>Technical details and specifications</item>
          <item>Code snippets</item>
          <item>Product features</item>
        </strict_preservation>
      </requirements>

      <output_instructions>
        Return direct JSON without additional formatting or explanation. The response must be valid JSON that matches the schema exactly. Do not include any text outside the JSON structure.
      </output_instructions>
    </prompt>`;

    const structuredModel = this.model.withStructuredOutput(newsletterSectionsSchema);
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
        You are a professional newsletter writer tasked with creating content from extracted URL content about "${this.context.data.topic}".
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

    const structuredModel = this.model.withStructuredOutput(newsletterSectionsSchema);
    return await structuredModel.invoke([
      { role: 'user', content: prompt }
    ]);
  }

  // Rest of the class implementation remains the same
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
      const contentPromises = [];

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
      console.error('Content drafter agent execution error:', error);
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
          "title": "clear, engaging title",
          "subtitle": "optional subtitle"
        },
        "sections": [
          {
            "title": "section title",
            "content": "section content",
            "url": "source url",
            "image": "image url if available"
          }
        ],
        "footer": {
          "content": "conclusion",
          "callToAction": "optional call to action"
        }
      }
      </schema>
    `;
  }
}