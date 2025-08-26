import { AgentRole, AgentContext } from '@/agents/types';
import { ContentData } from '@/types/EmailContent';
import { BrandTheme } from '@/types/BrandTheme';
import { EmailCreationStep } from '@/components/steps/StepsIndicator';
import { agentService } from './api/agent-service';

export class NewChatService {
  private context: AgentContext;
  private currentStep: EmailCreationStep;
  private brandTheme: BrandTheme | null;

  constructor(data: ContentData, currentStep: EmailCreationStep, brandTheme: BrandTheme | null = null) {
    this.context = {
      messages: [],
      data,
      brandTheme: brandTheme || undefined
    };
    this.currentStep = currentStep;
    this.brandTheme = brandTheme;
  }

  private getAgentEndpoint(): string {
    switch (this.currentStep) {
      case EmailCreationStep.TOPIC:
        return 'data-collection';
      case EmailCreationStep.CONTENT:
        return 'content-editing';
      case EmailCreationStep.DESIGN:
        return 'design';
      case EmailCreationStep.SEND:
        return 'send-preparation';
      default:
        throw new Error(`No agent available for step: ${this.currentStep}`);
    }
  }

  public async processMessage(message: string) {
    try {
      const endpoint = this.getAgentEndpoint();

      // Add the user message to context BEFORE sending to API
      this.context.messages.push({ role: 'user', content: message });

      // Only include brandTheme for design and HTML generation steps
      const needsBrandTheme = this.currentStep === EmailCreationStep.DESIGN;

      const request = {
        message,
        context: {
          ...this.context,
          brandTheme: needsBrandTheme ? this.brandTheme : undefined
        }
      };

      let response;
      switch (endpoint) {
        case 'data-collection':
          response = await agentService.dataCollection(request);
          break;
        case 'content-editing':
          response = await agentService.contentEditing(request);
          break;
        case 'design':
          response = await agentService.design(request);
          break;
        case 'send-preparation':
          response = await agentService.sendPreparation(request);
          break;
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      // Add assistant response to context
      this.context.messages.push({ role: 'assistant', content: response.content });

      return {
        message: response.content,
        metadata: response.metadata
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  public getConversationHistory() {
    return this.context.messages;
  }

  public clearConversation() {
    this.context.messages = [];
  }

  public updateData(newData: ContentData) {
    this.context.data = newData;
  }

  public updateBrandTheme(newBrandTheme: BrandTheme | null) {
    this.brandTheme = newBrandTheme;
    this.context.brandTheme = newBrandTheme || undefined;
  }
}
