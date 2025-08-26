import { ContentData } from '@/types/EmailContent';
import { agentService } from './api/agent-service';

export const newContentGenerationService = {
  async generateContent(data: ContentData): Promise<{ content: string[]; error?: string }> {
    try {
      const response = await agentService.contentGeneration({
        data,
        brandTheme: undefined // Will be passed from context if available
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
