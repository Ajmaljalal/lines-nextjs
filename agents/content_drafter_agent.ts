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

    const prompt = `Create a structured email/newsletter about "${this.context.data.topic}" based on the following web search results. Make the language more engaging and attractive, but do not omit, summarize away, or alter any key information from the original content. Only reorganize or refine sentences where helpful for clarity or interest. Keep all important facts intact and absolutely do not add new information not found in the source material.

    Web Search Results:
    ${this.context.data.webSearchContent.map(result => `
    Title: ${result.title}
    Content: ${result.content}
    Source: ${result.url}
    ---`).join('\n')}

    Create the email content with:
    1. A header section with an engaging title and optional subtitle
    2. 3-5 content sections (minimum 3 sections), each with a clear title and the content from the search results made more appealing without removing facts
    3. A footer section with a conclusion and optional call-to-action

    Rules:
    1. Do not exclude any key points from the original results.
    2. Do not add imagined information.
    3. Maintain a neutral stance without bias.
    4. Keep content engaging and well-structured.
    5. Cite sources by including the original URLs.
    6. Include images if available.

    Today's date is ${new Date().toISOString().split('T')[0]}.

    IMPORTANT: 
    - Return the sections as a direct array, not a string.
    - Do not stringify the sections array.
    - Do not wrap any of these fields in extra quotation marks or store them as strings.
    - The final JSON format should look like this example, with no extra quotation marks or strings around the values:
    {
      "header": { ... },
      "sections": [
        { "title": "...", "content": "...", "url": "..." },
        { "title": "...", "content": "...", "url": "..." }
      ],
      "footer": { ... }
    }`;

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

    const prompt = `Create a structured email/newsletter about "${this.context.data.topic}" using the user-provided content below without altering or omitting any important details. Style it to be more engaging and easy to follow. You may enhance language and flow, but do not remove or add new facts.

    User Provided Content:
    ${this.context.data.userProvidedContent}

    ${this.context.data.urls?.length ? `Reference URLs:\n${this.context.data.urls.join('\n')}` : ''}
    ${this.context.data.style ? `Style preferences: ${this.context.data.style}` : ''}

    Create the email content with:
    1. A header section with an engaging title and optional subtitle
    2. 3-5 content sections (minimum 3 sections), each with a clear title and the provided user content enhanced in language but matching the facts
    3. A footer section with a conclusion and optional call-to-action

    Rules:
    1. Use the provided content as the primary source. 
    2. Do not omit crucial information. e.g. code, numbers, statistics, and other important details should not be omitted. 
    3. Do not add new information that is not present in the source.
    4. Maintain a neutral stance without bias.
    5. Keep content concise, engaging, and well-structured.
    6. Each section should be clearly distinct.
    7. Include provided URLs under each content section where appropriate.
    8. Include images if available, but do not fabricate images not referenced.

    Today's date is ${new Date().toISOString().split('T')[0]}.

    IMPORTANT:
    - Return the all fields as direct values, not strings inside quotation marks.
    - Do not wrap any of these fields in extra quotation marks or store them as strings.
    - The final JSON format should look like this example, with no extra quotation marks or strings around the values:
    {
      "header": { ... },
      "sections": [
        { "title": "...", "content": "...", "url": "..." },
        { "title": "...", "content": "...", "url": "..." }
      ],
      "footer": { ... }
    }`;

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

  private mergeContent(webContent: any | null, userContent: any | null): any {
    if (!webContent && !userContent) {
      throw new Error('No content generated from either source');
    }

    if (!webContent) return userContent;
    if (!userContent) return webContent;

    // Merge the content from both sources
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
      if (!this.context.data.webSearchContent?.length && !this.context.data.userProvidedContent?.trim()) {
        throw new Error('No input content provided - both web search and user content are empty');
      }

      const [webContent, userContent] = await Promise.all([
        this.generateWebContent(),
        this.generateUserContent()
      ]);

      const mergedContent = this.mergeContent(webContent, userContent);

      return {
        content: JSON.stringify(mergedContent),
        metadata: {
          type: 'draft_content',
          sections: mergedContent,
          sourceType: webContent && userContent ? 'combined' :
            webContent ? 'web_only' : 'user_only'
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
}