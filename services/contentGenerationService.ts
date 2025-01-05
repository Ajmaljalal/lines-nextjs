import { ContentDrafterAgent } from '@/agents/content_drafter_agent';
import { Newsletter } from '@/types/Newsletter';

export const contentGenerationService = {
  async generateContent(data: Newsletter): Promise<{ content: string[]; error?: string }> {
    try {
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
          urlsExtractedContent: data.urlsExtractedContent
        }
      });

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