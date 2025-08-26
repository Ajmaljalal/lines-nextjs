import { ContentData } from '@/types/EmailContent';
import { BrandTheme } from '@/types/BrandTheme';
import { agentService } from './api/agent-service';

export const newHtmlGenerationService = {
  async generateHtml(data: ContentData, brandTheme: BrandTheme | null): Promise<{ content: string; error?: string }> {
    try {
      const response = await agentService.htmlGeneration({
        data,
        brandTheme: brandTheme || undefined
      });

      return {
        content: response.content,
        error: response.error
      };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'HTML generation failed'
      };
    }
  }
};
