import { IAgent, AgentType, AgentConfig, AgentContext } from './types';
import { DataCollectionServerAgent } from '../data-collection/agent';
import { ContentEditingServerAgent } from '../content-editing/agent';
import { DesignServerAgent } from '../design/agent';
import { SendPreparationServerAgent } from '../send-preparation/agent';
import { ContentGenerationServerAgent } from '../content-generation/agent';
import { HtmlGenerationServerAgent } from '../html-generation/agent';

export class AgentFactory {
  static createAgent(
    type: AgentType,
    context: AgentContext,
    config: AgentConfig = {}
  ): IAgent {
    const defaultConfig: AgentConfig = {
      framework: 'langchain',
      temperature: 0.7,
      maxRetries: 3,
      timeout: 30000,
      ...config
    };

    switch (type) {
      case 'data-collection':
        return new DataCollectionServerAgent(context, defaultConfig);

      case 'content-generation':
        return new ContentGenerationServerAgent(context, defaultConfig);

      case 'content-editing':
        return new ContentEditingServerAgent(context, defaultConfig);

      case 'html-generation':
        return new HtmlGenerationServerAgent(context, defaultConfig);

      case 'design':
        return new DesignServerAgent(context, defaultConfig);

      case 'send-preparation':
        return new SendPreparationServerAgent(context, defaultConfig);

      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }
}
