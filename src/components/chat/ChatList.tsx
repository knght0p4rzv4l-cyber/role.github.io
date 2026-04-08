import React, { useRef } from 'react';
import { Character, Chat } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Info } from 'lucide-react';

interface ChatListProps {
  characters: Character[];
  chats: Chat[];
  onChatSelect: (id: string) => void;
  onEditCharacter: (char: Character) => void;
}

export function ChatList({ characters, chats, onChatSelect, onEditCharacter }: ChatListProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (char: Character) => {
    longPressTimer.current = setTimeout(() => {
      onEditCharacter(char);
    }, 600); // 600ms for long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 text-ios-text-secondary">
        <p className="text-center">No hay personajes aún.</p>
        <p className="text-sm">Toca el botón + para crear uno.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
      {characters.map((char) => {
        const chat = chats.find(c => c.characterId === char.id);
        return (
          <div
            key={char.id}
            className="flex items-center px-4 py-3 active:bg-gray-100 dark:active:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <div 
              className="flex-1 flex items-center space-x-3 cursor-pointer" 
              onClick={() => onChatSelect(char.id)}
              onMouseDown={() => handleTouchStart(char)}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
              onTouchStart={() => handleTouchStart(char)}
              onTouchEnd={handleTouchEnd}
            >
              <Avatar className="w-14 h-14">
                <AvatarImage src={char.avatar} />
                <AvatarFallback className="bg-ios-blue text-white text-xl">
                  {char.name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center space-x-2 min-w-0">
                    <h3 className="font-semibold text-[17px] truncate dark:text-white">{char.name}</h3>
                    {chat?.unreadCount && chat.unreadCount > 0 ? (
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />
                    ) : null}
                  </div>
                  {chat?.lastTimestamp && (
                    <span className="text-xs text-ios-text-secondary dark:text-gray-400">
                      {format(chat.lastTimestamp, 'HH:mm')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-ios-text-secondary dark:text-gray-400 truncate pr-4">
                  {chat?.lastMessage || char.description}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => onEditCharacter(char)}
              className="p-2 text-ios-blue hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full"
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
