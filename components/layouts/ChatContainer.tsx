'use client';

import React, { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Card } from '../core-ui-components/card';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MessageRole } from '@/types/newsletter';
import InputContainer from './InputContainer';

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
    bg-zinc-900/80
    backdrop-blur-sm
    border-t
    border-zinc-800`,

  inputWrapper: `
    w-full
    p-4`
};

const ChatContainer: React.FC = () => {
  const { messages, isFetching, subscribeToMessages, addMessage } = useChat();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversation') || undefined;

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMessages(conversationId);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToMessages, conversationId]);

  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  const handleExampleClick = async (text: string) => {
    try {
      const result = await addMessage({ text, conversationId });
      if (!result) return;
      router.push(`${pathname.split('?')[0]}?conversation=${result.conversationId}`);
    } catch (error) {
      console.error('Error handling example click:', error);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>

        <div className={styles.messageContainer}>
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`
                px-4 
                py-1
                rounded-[12px]
                ${msg.role === MessageRole.AI ? 'bg-zinc-900' : 'bg-zinc-800'}
                ${msg.role === MessageRole.AI ? 'self-start' : 'self-end'}
              `}
            >
              {msg.role === MessageRole.AI ? (
                <div dangerouslySetInnerHTML={{ __html: msg.content }}></div>
              ) : (
                <p>{msg.content}</p>
              )}
            </Card>
          ))}
          {isFetching && (
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
          <InputContainer />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;