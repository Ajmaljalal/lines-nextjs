import { HtmlGenerationServerAgent } from '@/server/agents/html-generation/agent';
import { ContentData } from '@/types/EmailContent';
import { BrandTheme } from '@/types/BrandTheme';

export const htmlGenerationService = {
  async generateHtml(data: ContentData, currentTheme: BrandTheme | null): Promise<{ content: string; error?: string }> {
    try {
      // Create the marketing HTML generator agent
      const agent = new HtmlGenerationServerAgent({
        messages: [],
        data: {
          id: data.id,
          userId: data.userId,
          status: data.status,
          createdAt: data.createdAt.toISOString(),
          updatedAt: data.updatedAt.toISOString(),
          topic: data.topic || '',
          urls: data.urls || [],
          style: data.style || '',
          generatedContent: data.generatedContent || '',
          userProvidedContent: data.userProvidedContent || '',
          webSearch: data.webSearch || false,
          webSearchContent: data.webSearchContent || [],
          urlsExtractedContent: data.urlsExtractedContent || [],
          contentType: data.contentType || 'marketing',
        }
      });

      const response = await agent.execute({
        data: data,
        messages: [],
        brandTheme: currentTheme || null
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return { content: response.content };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'HTML generation failed'
      };
    }
  }
}; 