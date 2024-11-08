'use client';

import React, { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Card } from './ui/card';
import WelcomeMessage from './WelcomeMessage';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MessageRole } from '@/types/newsletter';

const styles = {
  container: `
  w-full
  flex
  flex-col
  items-center
  gap-6
  overflow-y-auto
  pt-40
  pb-[200px]
  `,

  title: `
  text-4xl
  font-semibold
  text-zinc-200`,

  subtitle: `
  text-zinc-400
  text-center`,

  examplesSection: `
  w-full
  max-w-2xl
  mt-4`,

  exampleQuery: `
  bg-zinc-800 
  hover:bg-zinc-700 
  transition-colors 
  p-4 
  rounded-lg 
  cursor-pointer 
  flex 
  items-center 
  gap-3`,

  messageContainer: `
  w-full
  max-w-4xl
  space-y-4
  rounded-lg
  flex
  flex-col
  `
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
      // Optionally, show an error message to the user
    }
  }

  console.log('isFetching', isFetching);

  return (
    <div className={styles.container}>
      {messages.length === 0 ? (
        <WelcomeMessage handleExampleClick={handleExampleClick} />
      ) : (
        <div className={styles.messageContainer}>
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`
                px-6 
                py-3
                rounded-[30px]
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
      )}
    </div>
  );
};

export default ChatContainer;