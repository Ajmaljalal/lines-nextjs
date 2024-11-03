'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { ChevronUp, ArrowUp } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea"


// import { useChat } from '../contexts/ChatContext';

const styles = {
  container: 'w-full max-w-4xl sm:mb-8',
  inputContainer: 'relative flex items-end',
  button: 'absolute w-8 h-8 right-2 bottom-2 bg-zinc-700 rounded-[8px] hover:bg-zinc-600',
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
  min-h-[44px]
  max-h-[150px] 
  sm:max-h-[450px] 
  resize-none
  overflow-hidden`,
};

const InputContainer: React.FC = () => {
  const [input, setInput] = useState('');
  // const { addMessage, fetchChatResponse } = useChat();

  const sendMessage = () => {
    const message = input.trim();
    if (message === '') return;

    // addMessage('user', message);
    setInput('');
    // fetchChatResponse(message);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-adjust height
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 550)}px`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <Textarea
          id="userInput"
          placeholder="What would you like to write about?"
          value={input}
          rows={1}
          onChange={handleTextareaChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className={styles.textarea}
        />
        <Button
          onClick={sendMessage}
          className={styles.button}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default InputContainer;