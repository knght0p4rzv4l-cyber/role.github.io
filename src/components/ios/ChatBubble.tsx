import React from 'react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatBubbleProps {
  message: Message;
  isUser: boolean;
  key?: string | number;
}

export function ChatBubble({ message, isUser }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full mb-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] px-3 py-2 shadow-sm relative",
          isUser 
            ? "bg-ios-bubble-user rounded-2xl rounded-tr-none" 
            : "bg-ios-bubble-ai rounded-2xl rounded-tl-none"
        )}
      >
        {!isUser && (
          <div className="text-[10px] font-bold text-ios-blue mb-0.5">
            {message.senderName}
          </div>
        )}
        
        {message.image && (
          <img 
            src={message.image} 
            alt="AI Generated" 
            className="rounded-lg mb-2 max-w-full h-auto"
            referrerPolicy="no-referrer"
          />
        )}
        
        <p className="text-[15px] leading-tight text-black whitespace-pre-wrap">
          {message.text}
        </p>
        
        <div className="flex justify-end items-center mt-1 space-x-1">
          <span className="text-[10px] text-ios-text-secondary">
            {format(message.timestamp, 'HH:mm')}
          </span>
          {isUser && (
            <div className="flex -space-x-1">
              <span className="text-[10px] text-ios-blue">✓</span>
              <span className="text-[10px] text-ios-blue">✓</span>
            </div>
          )}
        </div>

        {/* Bubble tail */}
        <div 
          className={cn(
            "absolute top-0 w-2 h-2",
            isUser 
              ? "-right-1 bg-ios-bubble-user [clip-path:polygon(0_0,0_100%,100%_0)]" 
              : "-left-1 bg-ios-bubble-ai [clip-path:polygon(100%_0,100%_100%,0_0)]"
          )}
        />
      </div>
    </div>
  );
}
