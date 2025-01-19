import { AgentFactory } from '@/agents/factory';
import { AgentRole, AgentContext } from '@/agents/types';
import { ContentData } from '@/types/EmailContent';
import { BrandTheme } from '@/types/BrandTheme';
import { EmailCreationStep } from '@/components/steps/StepsIndicator';

export class ChatService {
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

  private getAgentForStep(): AgentRole {
    switch (this.currentStep) {
      case EmailCreationStep.TOPIC:
        return AgentRole.DATA_COLLECTION;
      case EmailCreationStep.CONTENT:
        return AgentRole.CONTENT_EDITING;
      case EmailCreationStep.DESIGN:
        return AgentRole.DESIGN;
      case EmailCreationStep.SEND:
        return AgentRole.SEND_PREPARATION;
      default:
        throw new Error(`No agent available for step: ${this.currentStep}`);
    }
  }

  public async processMessage(message: string) {
    try {
      const agentRole = this.getAgentForStep();
      const agent = AgentFactory.createAgent(
        agentRole,
        this.context,
        { brandTheme: this.brandTheme }
      );

      const response = await agent.execute(message);

      if (response.error) {
        throw new Error(response.error);
      }

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
} 