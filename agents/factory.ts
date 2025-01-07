import { DataCollectionAgent } from './data_collection_agent';
import { ContentEditingAgent } from './content_editing_agent';
import { DesignAgent } from './design_agent';
import { AgentContext, AgentRole } from './types';
import { BrandTheme } from '@/types/BrandTheme';

export class AgentFactory {
  static createAgent(role: AgentRole, context: AgentContext, additionalData?: any) {
    switch (role) {
      case AgentRole.DATA_COLLECTION:
        return new DataCollectionAgent(context);
      case AgentRole.CONTENT_EDITING:
        return new ContentEditingAgent(context);
      case AgentRole.DESIGN:
        if (!additionalData?.brandTheme) {
          throw new Error('Brand theme is required for design agent');
        }
        return new DesignAgent(context, additionalData.brandTheme as BrandTheme);
      default:
        throw new Error(`Unknown agent role: ${role}`);
    }
  }
} 