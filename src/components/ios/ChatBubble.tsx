import React from 'react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatBubbleProps {
  message: Message;
  isUser: boolean;
  key?: string | number;
}

export function ChatBubble({ message, isUser }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full mb-2 items-end space-x-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && message.senderAvatar && (
        <Avatar className="w-8 h-8 mb-1">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback className="bg-ios-blue text-white text-[10px]">
            {message.senderName[0]}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          "max-w-[75%] px-3 py-2 shadow-sm relative",
          isUser ? "ios-bubble-user" : "ios-bubble-ai"
        )}
      >
        {!isUser && (
          <div className="text-[10px] font-bold text-ios-blue mb-0.5 flex justify-between items-center">
            <span>{message.senderName}</span>
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
        
        <p className="text-[15px] leading-tight text-black dark:text-white whitespace-pre-wrap">
          {message.text}
        </p>
        
        <div className="flex justify-end items-center mt-1 space-x-1">
          <span className="text-[10px] text-ios-text-secondary dark:text-gray-400">
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
              ? "-right-1 bg-ios-bubble-user dark:bg-[#056162] [clip-path:polygon(0_0,0_100%,100%_0)]" 
              : "-left-1 bg-ios-bubble-ai dark:bg-[#262628] [clip-path:polygon(100%_0,100%_100%,0_0)]"
          )}
        />
      </div>
    </div>
  );
}
