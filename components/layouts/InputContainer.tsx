'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../core-ui-components/button';
import { ArrowUp } from 'lucide-react';
import { Textarea } from '../core-ui-components/textarea';

interface InputContainerProps {
  onSendMessage: (message: string) => Promise<any>;
  isDisabled?: boolean;
  isSending?: boolean;
}

const styles = {
  container: 'w-full',
  inputContainer: 'relative flex',
  button: `
    absolute 
    w-8 
    h-8 
    right-2 
    top-2 
    bg-[var(--primary-color)] 
    rounded-[8px] 
    hover:bg-[var(--secondary-color)]
    transition-colors
    text-white
    duration-200`,
  textarea: `
    w-full 
    bg-[var(--input-background)]
    text-[var(--input-foreground)]
    px-4 
    py-3 
    pr-12 
    focus:outline-none 
    focus:ring-1 
    focus:ring-[var(--muted-foreground)] 
    rounded-[12px] 
    min-h-[100px]
    max-h-[150px] 
    resize-none
    overflow-y-auto`
};

const InputContainer: React.FC<InputContainerProps> = ({
  onSendMessage,
  isDisabled = false,
  isSending = false
}) => {
  const [input, setInput] = useState('');
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
    if (message === '' || isSending || isDisabled) return;

    try {
      await onSendMessage(message);
      setInput('');

      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
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
          disabled={isDisabled || isSending}
        />
        <Button
          onClick={sendMessage}
          className={styles.button}
          disabled={isDisabled || isSending}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default InputContainer;