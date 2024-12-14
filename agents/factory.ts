import { EditorAgent } from './editor';
import { PlannerAgent } from './planer';
import { AgentContext, AgentRole, NewsletterPlan } from './types';
import { WriterAgent } from './writer';

export class AgentFactory {
  static createAgent(role: AgentRole, context: AgentContext, additionalData?: any) {
    switch (role) {
      case AgentRole.PLANNER:
        return new PlannerAgent(context);
      case AgentRole.WRITER:
        if (!additionalData?.plan) {
          throw new Error('Newsletter plan is required for writer agent');
        }
        return new WriterAgent(context, additionalData.plan as NewsletterPlan);
      case AgentRole.EDITOR:
        if (!additionalData?.content) {
          throw new Error('Content is required for editor agent');
        }
        return new EditorAgent(context, additionalData.content as string);
      default:
        throw new Error(`Unknown agent role: ${role}`);
    }
  }
}
