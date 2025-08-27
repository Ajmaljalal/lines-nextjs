import { TavilyService } from '@/services/tavilyService';
import { ContentData } from '@/types/EmailContent';
import { ContentGenerationServerAgent } from '@/server/agents/content-generation/agent';

export const contentGenerationService = {
  async generateContent(data: ContentData): Promise<{ content: string[]; error?: string }> {
    try {
      // 1. If there are URLs, extract content from them
      if (data.urls && data.urls.length > 0) {
        const extractionResult = await TavilyService.extractContent(data.urls);
        // Store the raw_content in the email object
        data.urlsExtractedContent = extractionResult.results.map(item => item.raw_content);
      }

      // 2. Create the marketing content drafter agent
      const agent = new ContentGenerationServerAgent({
        messages: [],
        data: {
          id: data.id,
          userId: data.userId,
          status: data.status,
          createdAt: data.createdAt.toISOString(),
          updatedAt: data.updatedAt.toISOString(),
          topic: data.topic,
          userProvidedContent: data.userProvidedContent,
          urls: data.urls,
          style: data.style,
          webSearch: data.webSearch,
          webSearchContent: data.webSearchContent,
          urlsExtractedContent: data.urlsExtractedContent,
          contentType: data.contentType
        }
      });

      // 3. Execute the agent, which will handle the content drafting
      const response = await agent.execute({
        data: data,
        messages: [],
        brandTheme: null
      });
      if (response.error) {
        throw new Error(response.error);
      }

      return {
        content: [response.content]
      };
    } catch (error) {
      return {
        content: [],
        error: error instanceof Error ? error.message : 'Generation failed'
      };
    }
  }
};