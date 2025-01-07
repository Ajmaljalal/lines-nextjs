'use client';

import React, { useEffect } from 'react';
import { Card } from '../core-ui-components/card';
import { AgentMessage } from '@/agents/types';
import InputContainer from './InputContainer';

interface ChatContainerProps {
  messages: AgentMessage[];
  isSending: boolean;
  onSendMessage: (message: string) => Promise<any>;
  isDisabled?: boolean;
}

const styles = {
  wrapper: `
    h-full
    flex
    flex-col
    relative`,

  container: `
    w-full
    h-full
    flex
    flex-col
    items-center
    gap-6
    overflow-y-auto
    px-4
    pt-4
    pb-[160px]`,

  messageContainer: `
    w-full
    max-w-4xl
    space-y-4
    rounded-lg
    flex
    flex-col`,

  inputArea: `
    absolute
    bottom-0
    left-0
    right-0
    z-10
    bg-foreground/10
    backdrop-blur-sm
    rounded-[12px]
    `,

  inputWrapper: `
    w-full
    p-4`
};

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isSending,
  onSendMessage,
  isDisabled = false
}) => {
  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.messageContainer}>
          {messages?.map((msg, index) => (
            <Card
              key={index}
              className={`
                px-4 
                py-1
                rounded-[12px]
                ${msg.role === 'assistant' ? 'bg-zinc-100' : 'bg-zinc-300'}
                ${msg.role === 'assistant' ? 'self-start' : 'self-end'}
              `}
            >
              {msg.role === 'assistant' ? (
                <div dangerouslySetInnerHTML={{ __html: msg.content }}></div>
              ) : (
                <p>{msg.content}</p>
              )}
            </Card>
          ))}
          {isSending && (
            <Card className="self-start px-6 py-3 rounded-[30px] bg-zinc-900">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
              </div>
            </Card>
          )}
        </div>
      </div>
      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <InputContainer
            onSendMessage={onSendMessage}
            isDisabled={isDisabled}
            isSending={isSending}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;