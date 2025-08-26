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

export interface ContentData {
  id: string;
  userId: string;
  topic: string;
  contentType: 'marketing';
  userProvidedContent: string;
  webSearch: boolean;
  webSearchContent: {
    title: string;
    content: string;
    url: string;
  }[];
  urlsExtractedContent: string[];
  urls: string[];
  style: string;
  generatedContent?: string;
  htmlContent?: string;
  recipients?: string[];
  subject?: string;
  fromEmail?: string;
  replyToEmail?: string;
  senderName?: string;
  status: 'draft' | 'sent';
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
  loadingState?: 'webSearch' | 'urlExtraction' | 'contentGeneration' | null;
}



