import React from 'react';
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
  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 text-ios-text-secondary">
        <p className="text-center">No hay personajes aún.</p>
        <p className="text-sm">Toca el botón + para crear uno.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 bg-white rounded-xl overflow-hidden shadow-sm">
      {characters.map((char) => {
        const chat = chats.find(c => c.characterId === char.id);
        return (
          <div
            key={char.id}
            className="flex items-center px-4 py-3 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
          >
            <div className="flex-1 flex items-center space-x-3" onClick={() => onChatSelect(char.id)}>
              <Avatar className="w-14 h-14">
                <AvatarImage src={char.avatar} />
                <AvatarFallback className="bg-ios-blue text-white text-xl">
                  {char.name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-[17px] truncate">{char.name}</h3>
                  {chat?.lastTimestamp && (
                    <span className="text-xs text-ios-text-secondary">
                      {format(chat.lastTimestamp, 'HH:mm')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-ios-text-secondary truncate pr-4">
                  {chat?.lastMessage || char.description}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => onEditCharacter(char)}
              className="p-2 text-ios-blue hover:bg-gray-50 rounded-full"
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
