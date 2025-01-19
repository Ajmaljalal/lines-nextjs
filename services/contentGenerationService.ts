import { ContentDrafterAgent } from '@/agents/content_drafter_agent';
import { Newsletter } from '@/types/Newsletter';
import { TavilyService } from '@/services/tavilyService';
import { ContentData } from '@/types/EmailContent';

export const contentGenerationService = {
  async generateContent(data: ContentData): Promise<{ content: string[]; error?: string }> {
    try {
      // 1. If there are URLs, extract content from them
      if (data.urls && data.urls.length > 0) {
        const extractionResult = await TavilyService.extractContent(data.urls);
        // Store the raw_content in the newsletter object
        data.urlsExtractedContent = extractionResult.results.map(item => item.raw_content);
      }

      // 2. Pass updated data (with urlsExtractedContent) to your LLM agent
      const agent = new ContentDrafterAgent({
        messages: [],
        data: {
          id: data.id,
          userId: data.userId,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
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
      const response = await agent.execute();
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