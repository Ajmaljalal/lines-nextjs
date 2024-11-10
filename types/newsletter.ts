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
      instructions_for_AI: string;
      required: boolean;
      status: StepStatus;
      topic: string;
    };
    step_2_sections: {
      instructions_for_AI: string;
      required: boolean;
      status: StepStatus;
      sections: string[];
    };
    step_3_user_provided_content: {
      instructions_for_AI: string;
      required: boolean;
      status: StepStatus;
      userProvidedContent: string;
    };
    step_4_newsletter_draft_content: {
      instructions_for_AI: string;
      required: boolean;
      status: StepStatus;
      content: string;
    };
    step_5_newsletter_html_structure: {
      instructions_for_AI: string;
      required: boolean;
      status: StepStatus;
      html_structure: string;
    };
    step_6_recipients: {
      instructions_for_AI: string;
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
  userId: string;
  currentStep: NewsletterStep;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed';
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
        instructions_for_AI: 'In this step, make sure the user has a clear understanding of the topic they want to write about.',
        required: true,
        status: StepStatus.NOT_STARTED,
        topic: '',
      },
      step_2_sections: {
        instructions_for_AI: 'In this step, make sure the user has a clear understanding of the different sections they want to write about based on the selected topic in step 1',
        required: true,
        status: StepStatus.NOT_STARTED,
        sections: [],
      },
      step_3_user_provided_content: {
        instructions_for_AI: 'In this step, ask user has specific contents like text, links and other things for the topic and sections they selected in step 1 and 2',
        required: false,
        status: StepStatus.NOT_STARTED,
        userProvidedContent: '',
      },
      step_4_newsletter_draft_content: {
        instructions_for_AI: 'This step will be handled by another AI, so we will not ask the user for any input here.',
        required: true,
        status: StepStatus.NOT_STARTED,
        content: '',
      },
      step_5_newsletter_html_structure: {
        instructions_for_AI: 'In this step, ask the user to provide a general idea of what the HTML should look like for the newsletter. You can ask for specific styles, fonts, colors, etc. You can suggest some ideas if the user does not provide any.',
        required: true,
        status: StepStatus.NOT_STARTED,
        html_structure: '',
      },
      step_6_recipients: {
        instructions_for_AI: 'In this step, ask the user to provide a list of recipients for the newsletter. You can ask for specific details like email addresses, names, etc.',
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
    currentStep: NewsletterStep.TOPIC,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: userId,
    status: 'active',

  }
}


