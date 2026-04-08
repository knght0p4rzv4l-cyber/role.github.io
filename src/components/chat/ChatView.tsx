import React, { useState, useRef, useEffect } from 'react';
import { Character, Chat, Message, UserProfile, Settings } from '@/types';
import { NavBar } from '../ios/NavBar';
import { ChatBubble } from '../ios/ChatBubble';
import { Send, Image as ImageIcon, Sparkles, Trash2, Plus, Camera, Wand2, Phone, X, UserPlus, ShieldOff } from 'lucide-react';
import { generateAIResponse, generateAIImage } from '@/lib/ai';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ChatViewProps {
  character: Character;
  chat?: Chat;
  userProfile: UserProfile;
  settings: Settings;
  onBack: () => void;
  onAddMessage: (msg: Message, isFromAI?: boolean) => void;
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
  const [showInfo, setShowInfo] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const store = useStore();
  const storeCharacters = store.characters;

  useEffect(() => {
    if (settings.autoMessages && !isTyping) {
      const timer = setTimeout(() => {
        handleContinue();
      }, 10000 + Math.random() * 20000); // Random interval between 10-30s
      return () => clearTimeout(timer);
    }
  }, [chat?.messages, settings.autoMessages, isTyping]);

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
    // Reset unread when viewing chat
    if (chat?.unreadCount && chat.unreadCount > 0) {
      store.resetUnread(character.id);
    }
  }, [chat?.messages, isTyping, chat?.unreadCount]);

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

    onAddMessage(userMsg, false);
    setInputText('');
    setUserImage(null);
    
    if (character.isGroup && character.memberIds) {
      // Group logic: each member responds (if not suspended)
      for (const memberId of character.memberIds) {
        if (character.suspendedMemberIds?.includes(memberId)) continue;
        const member = storeCharacters.find(c => c.id === memberId);
        if (member) {
          await respondAs(member);
        }
      }
    } else {
      await respondAs(character);
    }
  };

  const respondAs = async (char: Character) => {
    setIsTyping(true);
    const history = chat?.messages || [];
    const responseText = await generateAIResponse(
      char,
      history,
      userProfile,
      settings,
      undefined
    );

    const aiMsg: Message = {
      id: Date.now().toString() + Math.random(),
      senderId: char.id,
      senderName: char.name,
      senderAvatar: char.avatar,
      text: responseText,
      timestamp: Date.now(),
    };

    onAddMessage(aiMsg, true);
    setIsTyping(false);
  };

  const handleContinue = async () => {
    if (character.isGroup && character.memberIds) {
      // Random member continues or all? Let's pick one random for "continue" (not suspended)
      const activeMembers = character.memberIds.filter(id => !character.suspendedMemberIds?.includes(id));
      if (activeMembers.length === 0) return;
      const randomId = activeMembers[Math.floor(Math.random() * activeMembers.length)];
      const member = storeCharacters.find(c => c.id === randomId);
      if (member) await respondAs(member);
    } else {
      await respondAs(character);
    }
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
      onAddMessage(aiMsg, true);
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
        title={
          <button onClick={() => setShowInfo(true)} className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={character.avatar} />
              <AvatarFallback>{character.name[0]}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{character.name}</span>
          </button>
        }
        onBack={onBack}
        rightAction={
          <div className="flex items-center space-x-2">
            {!character.isGroup && settings.betaCallMode && (
              <button onClick={() => setIsCalling(true)} className="text-ios-blue">
                <Phone className="w-6 h-6" />
              </button>
            )}
            <button onClick={onClearChat} className="text-red-500">
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        }
      />

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="p-6 flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4 border-4 border-ios-blue/20">
                  <AvatarImage src={character.avatar} />
                  <AvatarFallback className="text-3xl">{character.name[0]}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold dark:text-white mb-1">{character.name}</h2>
                <p className="text-sm text-ios-text-secondary dark:text-gray-400 mb-4">{character.description}</p>
                
                <div className="w-full space-y-4 text-left">
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-ios-blue uppercase mb-1">Personalidad</p>
                    <p className="text-sm dark:text-gray-300">{character.personality}</p>
                  </div>
                  
                  {character.isGroup && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-ios-blue uppercase mb-2">Integrantes ({character.memberIds?.length || 0})</p>
                      <div className="flex flex-wrap gap-2">
                        {character.memberIds?.map(id => {
                          const m = storeCharacters.find(c => c.id === id);
                          const isSuspended = character.suspendedMemberIds?.includes(id);
                          return m ? (
                            <div key={id} className={cn(
                              "flex items-center space-x-1 px-2 py-1 rounded-full border text-[10px]",
                              isSuspended ? "bg-red-50 border-red-200 text-red-500" : "bg-blue-50 border-blue-200 text-ios-blue"
                            )}>
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={m.avatar} />
                                <AvatarFallback>{m.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>{m.name}</span>
                              {isSuspended && <ShieldOff className="w-2 h-2 ml-1" />}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setShowInfo(false)}
                  className="mt-6 w-full bg-ios-blue text-white py-3 rounded-xl font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Modal */}
      <AnimatePresence>
        {isCalling && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-gray-900 z-[110] flex flex-col items-center justify-between py-20 px-6"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="w-32 h-32 mb-6 border-4 border-ios-blue animate-pulse">
                  <AvatarImage src={character.avatar} />
                  <AvatarFallback className="text-4xl">{character.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-ios-blue text-white text-[10px] px-2 py-0.5 rounded-full">
                  BETA
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{character.name}</h2>
              <p className="text-ios-blue animate-pulse">Llamada en curso...</p>
            </div>

            <div className="w-full max-w-xs space-y-8">
              <div className="flex justify-center space-x-12">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <span className="text-xs text-white/60">Video</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <span className="text-xs text-white/60">Efectos</span>
                </div>
              </div>

              <button 
                onClick={() => setIsCalling(false)}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl active:scale-90 transition-transform"
              >
                <X className="w-10 h-10" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pt-28 pb-24 space-y-4 no-scrollbar"
        style={{ 
          backgroundImage: `url("${settings.chatBackground || 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'}")`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {chat?.messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} isUser={msg.senderId === 'user'} />
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm italic text-xs text-gray-500 dark:text-gray-400">
              Alguien está escribiendo...
            </div>
          </div>
        )}
        
        {!settings.autoMessages && !isTyping && chat?.messages.length && chat.messages.length > 0 && (
          <div className="flex justify-center py-2">
            <button 
              onClick={handleContinue}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs px-4 py-1.5 rounded-full border border-white/20 transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-3 h-3" />
              <span>Continuar historia</span>
            </button>
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
                  disabled={!inputText.trim() || (!settings.aiImages && !settings.superImages)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left",
                    (!inputText.trim() || (!settings.aiImages && !settings.superImages)) && "opacity-50 grayscale"
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
