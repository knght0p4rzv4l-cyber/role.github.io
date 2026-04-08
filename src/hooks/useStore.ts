import { useState, useEffect } from 'react';
import { Character, Chat, UserProfile, Settings, Message } from '../types';

const STORAGE_KEY = 'roleplay_ai_v1';

interface Store {
  characters: Character[];
  userProfile: UserProfile;
  chats: Chat[];
  settings: Settings;
}

const defaultSettings: Settings = {
  nsfwMode: false,
  superNsfwMode: false,
  shortWriting: false,
  aiImages: false,
  superImages: false,
  darkMode: false,
  autoMessages: false,
};

const defaultProfile: UserProfile = {
  name: 'Usuario',
  description: 'Un aventurero en busca de historias.',
};

const initialStore: Store = {
  characters: [],
  userProfile: defaultProfile,
  chats: [],
  settings: defaultSettings,
};

export function useStore() {
  const [store, setStore] = useState<Store>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialStore,
          ...parsed,
          settings: { ...defaultSettings, ...parsed.settings }
        };
      } catch (e) {
        console.error('Failed to parse storage', e);
      }
    }
    return initialStore;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const addCharacter = (char: Character) => {
    setStore(prev => ({
      ...prev,
      characters: [...prev.characters, char],
    }));
  };

  const updateCharacter = (char: Character) => {
    setStore(prev => ({
      ...prev,
      characters: prev.characters.map(c => c.id === char.id ? char : c),
    }));
  };

  const deleteCharacter = (id: string) => {
    setStore(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== id),
      chats: prev.chats.filter(c => c.characterId !== id),
    }));
  };

  const updateProfile = (profile: UserProfile) => {
    setStore(prev => ({ ...prev, userProfile: profile }));
  };

  const updateSettings = (settings: Partial<Settings>) => {
    setStore(prev => ({ ...prev, settings: { ...prev.settings, ...settings } }));
  };

  const addMessage = (chatId: string, message: Message, isFromAI: boolean = false) => {
    setStore(prev => {
      const chatIndex = prev.chats.findIndex(c => c.id === chatId);
      let newChats = [...prev.chats];

      if (chatIndex === -1) {
        newChats.push({
          id: chatId,
          characterId: chatId,
          messages: [message],
          lastMessage: message.text,
          lastTimestamp: message.timestamp,
          unreadCount: isFromAI ? 1 : 0,
        });
      } else {
        const chat = { ...newChats[chatIndex] };
        chat.messages = [...chat.messages, message];
        chat.lastMessage = message.text;
        chat.lastTimestamp = message.timestamp;
        if (isFromAI) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        }
        newChats[chatIndex] = chat;
      }

      return { ...prev, chats: newChats };
    });
  };

  const resetUnread = (chatId: string) => {
    setStore(prev => ({
      ...prev,
      chats: prev.chats.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c),
    }));
  };

  const clearChat = (chatId: string) => {
    setStore(prev => ({
      ...prev,
      chats: prev.chats.map(c => c.id === chatId ? { ...c, messages: [], lastMessage: '', lastTimestamp: undefined, unreadCount: 0 } : c),
    }));
  };

  return {
    ...store,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    updateProfile,
    updateSettings,
    addMessage,
    resetUnread,
    clearChat,
  };
}
