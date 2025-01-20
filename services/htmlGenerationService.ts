import { HtmlGeneratorAgent } from '@/agents/newsletter/html_generator_agent';
import { MarketingHtmlGeneratorAgent } from '@/agents/marketing/marketing_html_generator_agent';
import { ContentData } from '@/types/EmailContent';
import { BrandTheme } from '@/types/BrandTheme';

export const htmlGenerationService = {
  async generateHtml(data: ContentData, currentTheme: BrandTheme | null): Promise<{ content: string; error?: string }> {
    try {
      // Create the appropriate agent based on content type
      const agent = data.contentType === 'marketing'
        ? new MarketingHtmlGeneratorAgent({
          messages: [],
          data: {
            id: data.id,
            userId: data.userId,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            topic: data.topic || '',
            urls: data.urls || [],
            style: data.style || '',
            generatedContent: data.generatedContent || '',
            userProvidedContent: data.userProvidedContent || '',
            webSearch: data.webSearch || false,
            webSearchContent: data.webSearchContent || [],
            urlsExtractedContent: data.urlsExtractedContent || [],
            contentType: data.contentType || 'newsletter',
          }
        }, currentTheme)
        : new HtmlGeneratorAgent({
          messages: [],
          data: {
            id: data.id,
            userId: data.userId,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            topic: data.topic || '',
            urls: data.urls || [],
            style: data.style || '',
            generatedContent: data.generatedContent || '',
            userProvidedContent: data.userProvidedContent || '',
            webSearch: data.webSearch || false,
            webSearchContent: data.webSearchContent || [],
            urlsExtractedContent: data.urlsExtractedContent || [],
            contentType: data.contentType || 'newsletter',
          }
        }, currentTheme);

      const response = await agent.execute();
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