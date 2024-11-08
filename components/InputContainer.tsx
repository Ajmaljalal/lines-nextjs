'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ArrowUp } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea"
import { useChat } from '@/hooks/useChat';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

const styles = {
  container: 'w-full max-w-4xl fixed bottom-0 min-h-[130px] bg-zinc-900',
  inputContainer: 'relative flex',
  button: 'absolute w-8 h-8 right-2 top-2 bg-zinc-700 rounded-[8px] hover:bg-zinc-600',
  textarea: `
  w-full 
  bg-zinc-800 
  text-zinc-200 
  px-4 
  py-3 
  pr-12 
  focus:outline-none 
  focus:ring-2 
  focus:ring-zinc-600 
  rounded-[8px] 
  border 
  border-zinc-700 
  min-h-[100px]
  max-h-[150px] 
  sm:max-h-[450px] 
  resize-none
  overflow-y-auto`
};

const InputContainer: React.FC = () => {
  const [input, setInput] = useState('');
  const { addMessage, isSending } = useChat();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate new height while respecting max-height
    const maxHeight = window.innerWidth >= 640 ? 450 : 150; // sm breakpoint check
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
    scrollToBottom();
  };

  const sendMessage = async () => {
    const message = input?.trim();
    if (message === '' || isSending) return;

    const conversationIdFromParams = searchParams.get('conversation') || undefined;
    try {
      const result = await addMessage({ text: message, conversationId: conversationIdFromParams });
      setInput('');

      if (!result) return;
      if (!conversationIdFromParams) {
        router.push(`${pathname.split('?')[0]}?conversation=${result.conversationId}`);
      }

      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally, show an error message to the user
    }
  };

  // Adjust height on initial render and window resize
  useEffect(() => {
    adjustTextareaHeight();
    window.addEventListener('resize', adjustTextareaHeight);
    return () => window.removeEventListener('resize', adjustTextareaHeight);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <Textarea
          ref={textareaRef}
          id="userInput"
          placeholder="What would you like to write about?"
          value={input}
          rows={1}
          autoFocus
          onChange={handleTextareaChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage().then(() => {
                document.getElementById('userInput')?.focus();
              });
            }
          }}
          className={styles.textarea}
          disabled={isSending}
        />
        <Button
          onClick={sendMessage}
          className={styles.button}
          disabled={isSending}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default InputContainer;