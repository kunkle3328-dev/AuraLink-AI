import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface ChatLogProps {
  messages: ChatMessage[];
  streamingModelMessage: ChatMessage | null;
  streamingUserMessage: ChatMessage | null;
}

const BlinkingCursor = () => <span className="inline-block w-2 h-4 bg-[var(--text-tertiary)] animate-pulse ml-1"></span>;

const ChatLog: React.FC<ChatLogProps> = ({ messages, streamingModelMessage, streamingUserMessage }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingModelMessage, streamingUserMessage]);
  
  const streamingMessages: ChatMessage[] = [];
  if (streamingUserMessage) streamingMessages.push(streamingUserMessage);
  if (streamingModelMessage) streamingMessages.push(streamingModelMessage);

  const allMessages = [...messages, ...streamingMessages];

  if (allMessages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4 overflow-y-auto" style={{maxHeight: '20vh'}}>
      {allMessages.map((msg) => {
        const isStreaming = (streamingModelMessage?.id === msg.id) || (streamingUserMessage?.id === msg.id);
        return (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--border-primary)] to-[var(--glow-secondary)] flex-shrink-0"></div>
            )}
            <div className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md text-sm ${msg.role === 'user' ? 'bg-[var(--user-bubble)] text-white rounded-br-none' : 'bg-[var(--model-bubble)] text-[var(--text-primary)] rounded-bl-none'}`}>
              <p>
                {msg.text}
                {isStreaming && <BlinkingCursor />}
              </p>
              {msg.role === 'model' && msg.sources && msg.sources.length > 0 && !isStreaming && (
                  <div className="mt-3 border-t border-[var(--border-secondary)] pt-2">
                      <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-1">Sources:</h4>
                      <ul className="space-y-1 list-none pl-0">
                          {msg.sources.map((source, index) => (
                          <li key={`${msg.id}-source-${index}`} className="text-xs truncate">
                              <a
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--bg-accent)] hover:underline flex items-start gap-1.5"
                              title={source.title}
                              >
                              <span className="flex-shrink-0 mt-0.5 w-3 h-3 bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-[9px] rounded-sm flex items-center justify-center font-mono">{index + 1}</span>
                              <span className="truncate">{source.title}</span>
                              </a>
                          </li>
                          ))}
                      </ul>
                  </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex-shrink-0"></div>
            )}
          </div>
        )
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatLog;