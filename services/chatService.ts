import { AgentFactory } from '@/agents/factory';
import { AgentRole, AgentContext } from '@/agents/types';
import { Newsletter } from '@/types/Newsletter';
import { BrandTheme } from '@/types/BrandTheme';
import { NewsletterStep } from '@/components/steps/StepsIndicator';

export class ChatService {
  private context: AgentContext;
  private currentStep: NewsletterStep;
  private brandTheme: BrandTheme | null;

  constructor(data: Newsletter, currentStep: NewsletterStep, brandTheme: BrandTheme | null = null) {
    this.context = {
      messages: [],
      data
    };
    this.currentStep = currentStep;
    this.brandTheme = brandTheme;
  }

  private getAgentForStep(): AgentRole {
    switch (this.currentStep) {
      case NewsletterStep.TOPIC:
        return AgentRole.DATA_COLLECTION;
      case NewsletterStep.CONTENT:
        return AgentRole.CONTENT_EDITING;
      case NewsletterStep.DESIGN:
        return AgentRole.DESIGN;
      case NewsletterStep.SEND:
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