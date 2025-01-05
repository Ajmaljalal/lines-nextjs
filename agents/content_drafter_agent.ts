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

    const prompt = `You are a professional newsletter writer tasked with creating a structured newsletter about "${this.context.data.topic}". 
    
Your task is to use ONLY the information from these web search results:

${this.context.data.webSearchContent.map((result, index) => `
[Source ${index + 1}]
Title: ${result.title}
Content: ${result.content}
URL: ${result.url}
---`).join('\n')}

RESPONSE FORMAT:
Provide a JSON object with exactly these fields:
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

STRICT REQUIREMENTS:
1. Create exactly 3-5 sections
2. Each section must:
   - Focus on a distinct aspect of the topic
   - Include the source URL
   - Contain all key facts from the source
   - Use engaging language without altering meaning
3. Do not:
   - Add information not in the sources
   - Remove important details
   - Merge unrelated facts
4. Raw numbers, statistics, and technical details must be preserved exactly
5. Return direct JSON without additional formatting or explanation

Note: The response must be valid JSON that matches the schema exactly. Do not include any text outside the JSON structure.`;

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

    const prompt = `You are a professional newsletter writer tasked with restructuring this user-provided content about "${this.context.data.topic}" into a clear newsletter format.

User Provided Content:
${this.context.data.userProvidedContent}

${this.context.data.urls?.length ? `REFERENCE URLS:\n${this.context.data.urls.join('\n')}` : ''}
${this.context.data.style ? `STYLE GUIDE:\n${this.context.data.style}` : ''}

RESPONSE FORMAT:
Provide a JSON object with exactly these fields:
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

STRICT REQUIREMENTS:
1. Compile user provided content into exactly 3-5 sections
2. Keep the content as close to the original as possible
3. Each section must:
   - Cover a distinct aspect
   - Include all provided content
   - Do not remove or summarize away details
   - Preserve technical accuracy
   - Use provided URLs where relevant
4. Do not:
   - Do not add new information
   - Do not remove or summarize away details
   - Do not alter technical specifications, including code snippets and other technical details
5. Preserve exactly:
   - All numbers and statistics
   - Technical details and specifications
   - Code snippets
   - Product features
6. Return direct JSON without additional formatting or explanation

Note: The response must be valid JSON that matches the schema exactly. Do not include any text outside the JSON structure.`;

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