export enum StepStatus {
  WAITING_FOR_USER_INPUT = "waiting_for_user_input",
  PROCESSING = "processing",
  WAITING_FOR_CONFIRMATION = "waiting_for_confirmation",
  CONFIRMED = "confirmed",
  NOT_STARTED = "not_started"
}

export enum ConversationType {
  TOPIC_DISCUSSION = 'topic_discussion',
  SECTION_REVIEW = 'section_review',
  CONTENT_REVIEW = 'content_review',
  HTML_REVIEW = 'html_review',
  RECIPIENT_REVIEW = 'recipient_review'
}

export enum MessageType {
  QUESTION = 'question',
  ANSWER = 'answer',
  CONFIRMATION = 'confirmation',
  REVISION_REQUEST = 'revision_request'
}

export interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: Date;
}

export enum MessageRole {
  USER = 'user',
  AI = 'ai'
}


export enum NewsletterStep {
  TOPIC = 'step_1_topic',
  SECTIONS = 'step_2_sections',
  USER_PROVIDED_CONTENT = 'step_3_user_provided_content',
  CONTENT = 'step_4_content',
  HTML = 'step_5_html',
  RECIPIENTS = 'step_6_recipients'
}

export interface NewsletterPlan {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  currentStep: NewsletterStep;
  conversationId: string;
  steps: {
    step_1_topic: {
      required: boolean;
      status: StepStatus;
      topic: string;
    };
    step_2_sections: {
      required: boolean;
      status: StepStatus;
      sections: string[];
    };
    step_3_user_provided_content: {
      required: boolean;
      status: StepStatus;
      userProvidedContent: string;
    };
    step_4_content: {
      required: boolean;
      status: StepStatus;
      content: string;
    };
    step_5_html: {
      required: boolean;
      status: StepStatus;
      html: string;
    };
    step_6_recipients: {
      required: boolean;
      status: StepStatus;
      recipientsList: string[];
    };
  };
}

export interface NewsletterConversation {
  id: string;
  newsletterPlanId: string;
  messages?: Message[];
  context: {
    currentStep: NewsletterStep;
    purpose: string;
    relevantContent?: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    status: 'active' | 'completed';
  };
}

export const getInitialNewsletterPlan = ({
  userId,
  conversationId,
  newsletterPlanId
}: {
  userId: string,
  conversationId: string,
  newsletterPlanId: string
}): NewsletterPlan => {
  return {
    id: newsletterPlanId,
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    currentStep: NewsletterStep.TOPIC,
    conversationId: conversationId,
    steps: {
      step_1_topic: {
        required: true,
        status: StepStatus.NOT_STARTED,
        topic: '',
      },
      step_2_sections: {
        required: true,
        status: StepStatus.NOT_STARTED,
        sections: [],
      },
      step_3_user_provided_content: {
        required: true,
        status: StepStatus.NOT_STARTED,
        userProvidedContent: '',
      },
      step_4_content: {
        required: true,
        status: StepStatus.NOT_STARTED,
        content: '',
      },
      step_5_html: {
        required: true,
        status: StepStatus.NOT_STARTED,
        html: '',
      },
      step_6_recipients: {
        required: true,
        status: StepStatus.NOT_STARTED,
        recipientsList: [],
      },
    },
  }
}

export const getInitialNewsletterConversation = ({
  userId,
  conversationId,
  newsletterPlanId
}: {
  userId: string,
  conversationId: string,
  newsletterPlanId: string
}): NewsletterConversation => {
  return {
    id: conversationId,
    newsletterPlanId: newsletterPlanId,
    context: {
      currentStep: NewsletterStep.TOPIC,
      purpose: '',
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userId,
      status: 'active',
    },
  }
}


