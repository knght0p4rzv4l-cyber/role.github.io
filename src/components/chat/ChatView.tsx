import React, { useState, useRef, useEffect } from 'react';
import { Character, Chat, Message, UserProfile, Settings } from '@/types';
import { NavBar } from '../ios/NavBar';
import { ChatBubble } from '../ios/ChatBubble';
import { Send, Image as ImageIcon, Sparkles, Trash2, Plus, Camera, Wand2 } from 'lucide-react';
import { generateAIResponse, generateAIImage } from '@/lib/ai';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ChatViewProps {
  character: Character;
  chat?: Chat;
  userProfile: UserProfile;
  settings: Settings;
  onBack: () => void;
  onAddMessage: (msg: Message) => void;
  onClearChat: () => void;
}

export function ChatView({ 
  character, 
  chat, 
  userProfile, 
  settings, 
  onBack, 
  onAddMessage,
  onClearChat
}: ChatViewProps) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() && !userImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      senderName: userProfile.name,
      text: inputText,
      timestamp: Date.now(),
      image: userImage || undefined,
    };

    onAddMessage(userMsg);
    setInputText('');
    setUserImage(null);
    setIsTyping(true);

    const history = chat?.messages || [];
    const responseText = await generateAIResponse(
      character,
      [...history, userMsg],
      userProfile,
      settings,
      userImage || undefined
    );

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      senderId: character.id,
      senderName: character.name,
      text: responseText,
      timestamp: Date.now(),
    };

    onAddMessage(aiMsg);
    setIsTyping(false);
  };

  const handleGenerateImage = async () => {
    if (!inputText.trim()) return;
    
    setIsTyping(true);
    const imageUrl = await generateAIImage(inputText, settings);
    
    if (imageUrl) {
      const aiMsg: Message = {
        id: Date.now().toString(),
        senderId: character.id,
        senderName: character.name,
        text: `He generado esta imagen para ti: "${inputText}"`,
        timestamp: Date.now(),
        image: imageUrl,
      };
      onAddMessage(aiMsg);
    }
    setIsTyping(false);
    setInputText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#E5DDD5] flex flex-col z-[60]">
      <NavBar
        title={character.name}
        onBack={onBack}
        rightAction={
          <button onClick={onClearChat} className="text-red-500">
            <Trash2 className="w-6 h-6" />
          </button>
        }
      />

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pt-28 pb-24 space-y-4 no-scrollbar"
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain' }}
      >
        {chat?.messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} isUser={msg.senderId === 'user'} />
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-2 shadow-sm italic text-xs text-gray-500">
              {character.name} está escribiendo...
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#F0F0F0] px-4 py-3 flex items-end space-x-2 pb-8 relative">
        <div className="relative" ref={menuRef}>
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10, x: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10, x: -10 }}
                className="absolute bottom-14 left-0 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 w-48 z-50 overflow-hidden"
              >
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <div className="bg-blue-500 p-1.5 rounded-lg text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[15px] font-medium">Subir fotos</span>
                </button>
                
                <div className="h-px bg-gray-100 mx-4" />
                
                <button
                  onClick={() => {
                    handleGenerateImage();
                    setShowActions(false);
                  }}
                  disabled={!inputText.trim() || !settings.aiImages}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left",
                    (!inputText.trim() || !settings.aiImages) && "opacity-50 grayscale"
                  )}
                >
                  <div className="bg-purple-500 p-1.5 rounded-lg text-white">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium">Crear imágenes</span>
                    {!inputText.trim() && (
                      <span className="text-[10px] text-ios-text-secondary">Escribe un prompt</span>
                    )}
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setShowActions(!showActions)}
            className={cn(
              "p-2 text-ios-blue transition-transform duration-200",
              showActions && "rotate-45"
            )}
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        
        <div className="flex-1 bg-white rounded-2xl px-3 py-1.5 flex flex-col border border-gray-300">
          {userImage && (
            <div className="relative mb-2">
              <img src={userImage} className="w-20 h-20 object-cover rounded-lg" />
              <button 
                onClick={() => setUserImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Mensaje"
            className="w-full bg-transparent border-none focus:ring-0 text-[16px] resize-none max-h-32 min-h-[36px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        <button 
          onClick={handleSend}
          disabled={!inputText.trim() && !userImage}
          className={cn(
            "p-2 rounded-full transition-colors",
            (inputText.trim() || userImage) ? "bg-ios-blue text-white" : "text-gray-400"
          )}
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
