import { DataCollectionAgent } from './data_collection_agent';
import { ContentEditingAgent } from './content_editing_agent';
import { DesignAgent } from './design_agent';
import { AgentContext, AgentRole } from './types';
import { BrandTheme } from '@/types/BrandTheme';
import { SendPreparationAgent } from './send_preparation_agent';
import { MarketingContentDrafterAgent } from './marketing/marketing_content_drafter_agent';
import { MarketingHtmlGeneratorAgent } from './marketing/marketing_html_generator_agent';

export class AgentFactory {
  static createAgent(role: AgentRole, context: AgentContext, additionalData?: any) {
    switch (role) {
      case AgentRole.DATA_COLLECTION:
        return new DataCollectionAgent(context);
      case AgentRole.CONTENT_EDITING:
        return new ContentEditingAgent(context);
      case AgentRole.DESIGN:
        return new DesignAgent(context, additionalData?.brandTheme || null);
      case AgentRole.SEND_PREPARATION:
        return new SendPreparationAgent(context);
      case AgentRole.MARKETING_CONTENT_DRAFT:
        return new MarketingContentDrafterAgent(context);
      case AgentRole.MARKETING_HTML_GENERATION:
        return new MarketingHtmlGeneratorAgent(context, additionalData?.brandTheme || null);
      default:
        throw new Error(`Unknown agent role: ${role}`);
    }
  }
} 