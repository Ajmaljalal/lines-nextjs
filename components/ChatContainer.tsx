'use client';

import React from 'react';
// import { useChat } from '../contexts/ChatContext';
import { Card } from './ui/card';

const ChatContainer: React.FC = () => {
  // const { messages, loading } = useChat();

  return (
    <div className="chat-container w-full flex flex-col items-center gap-6 pt-40">
      <h1 id="title" className="text-4xl font-semibold text-zinc-200">Welcome!</h1>
      <h3 id="subtitle" className="text-zinc-400 text-center">
        I am your assistant in generating beautifully designed emails & newsletters.
        <br />
        What would you like to write about?
      </h3>
      <div className="examples-section w-full max-w-2xl mt-4">
        <div className="example-queries flex flex-col gap-3">
          <div className="query-example bg-zinc-800 hover:bg-zinc-700 transition-colors p-4 rounded-lg cursor-pointer flex items-center gap-3">
            <span className="text-zinc-300">💡</span>
            <span>Create a tech newsletter about AI and machine learning developments</span>
          </div>
          <div
            className="query-example bg-zinc-800 hover:bg-zinc-700 transition-colors p-4 rounded-lg cursor-pointer flex items-center gap-3"
            onClick={() => {
              // useChat().addMessage('user', 'Generate a weekly summary newsletter on climate change news')
            }}
          >
            <span className="text-zinc-300">💡</span>
            <span>Generate a weekly summary newsletter on climate change news</span>
          </div>
          <div
            className="query-example bg-zinc-800 hover:bg-zinc-700 transition-colors p-4 rounded-lg cursor-pointer flex items-center gap-3"
            onClick={() => {
              // useChat().addMessage('user', 'Make a newsletter about startup funding rounds for this week')
            }}
          >
            <span className="text-zinc-300">💡</span>
            <span>Make a newsletter about startup funding rounds for this week</span>
          </div>
        </div>
      </div>
      <div id="chatMessages" className="w-full">
        {/* {messages.map((msg, index) => (
          <Card key={index} className={`message ${msg.sender}`}>
            {msg.sender === 'ai' ? (
              <div dangerouslySetInnerHTML={{ __html: msg.text }}></div>
            ) : (
              <p>{msg.text}</p>
            )}
          </Card>
        ))}
        {loading && (
          <div className="loading-indicator">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ChatContainer;