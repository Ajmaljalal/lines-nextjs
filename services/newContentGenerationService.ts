import { ContentData } from '@/types/EmailContent';
import { BrandTheme } from '@/types/BrandTheme';
import { agentService } from './api/agent-service';

export const newContentGenerationService = {
  async generateContent(data: ContentData, brandTheme?: BrandTheme | null): Promise<{ content: string[]; error?: string }> {
    try {
      const response = await agentService.contentGeneration({
        data,
        brandTheme: brandTheme || undefined
      });

      return {
        content: response.content, // response.content is already an array from the API
        error: response.error
      };
    } catch (error) {
      return {
        content: [],
        error: error instanceof Error ? error.message : 'Generation failed'
      };
    }
  }
};
