/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './hooks/useStore';
import { TabBar } from './components/ios/TabBar';
import { NavBar } from './components/ios/NavBar';
import { ChatList } from './components/chat/ChatList';
import { ChatView } from './components/chat/ChatView';
import { SettingsView } from './components/settings/SettingsView';
import { ProfileView } from './components/profile/ProfileView';
import { CharacterEditor } from './components/chat/CharacterEditor';
import { Character } from './types';
import { Plus } from 'lucide-react';

export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isEditingCharacter, setIsEditingCharacter] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  const activeChat = store.chats.find(c => c.id === activeChatId);
  const activeCharacter = store.characters.find(c => c.id === activeChatId);

  const handleCreateChat = () => {
    setEditingCharacter(null);
    setIsEditingCharacter(true);
  };

  const handleEditCharacter = (char: Character) => {
    setEditingCharacter(char);
    setIsEditingCharacter(true);
  };

  if (activeChatId && activeCharacter) {
    return (
      <ChatView
        character={activeCharacter}
        chat={activeChat}
        userProfile={store.userProfile}
        settings={store.settings}
        onBack={() => setActiveChatId(null)}
        onAddMessage={(msg) => store.addMessage(activeChatId, msg)}
        onClearChat={() => store.clearChat(activeChatId)}
      />
    );
  }

  if (isEditingCharacter) {
    return (
      <CharacterEditor
        character={editingCharacter}
        characters={store.characters}
        onSave={(char) => {
          if (editingCharacter) {
            store.updateCharacter(char);
          } else {
            store.addCharacter(char);
          }
          setIsEditingCharacter(false);
        }}
        onCancel={() => setIsEditingCharacter(false)}
        onDelete={(id) => {
          store.deleteCharacter(id);
          setIsEditingCharacter(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ios-bg pb-20 pt-24">
      <NavBar
        title={
          activeTab === 'chats' ? 'Chats' :
          activeTab === 'groups' ? 'Grupos' :
          activeTab === 'profile' ? 'Perfil' : 'Configuración'
        }
        rightAction={
          (activeTab === 'chats' || activeTab === 'groups') && (
            <button onClick={handleCreateChat} className="text-ios-blue">
              <Plus className="w-7 h-7" />
            </button>
          )
        }
      />

      <main className="px-4">
        {activeTab === 'chats' && (
          <ChatList
            characters={store.characters.filter(c => !c.isGroup)}
            chats={store.chats}
            onChatSelect={setActiveChatId}
            onEditCharacter={handleEditCharacter}
          />
        )}
        {activeTab === 'groups' && (
          <ChatList
            characters={store.characters.filter(c => c.isGroup)}
            chats={store.chats}
            onChatSelect={setActiveChatId}
            onEditCharacter={handleEditCharacter}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView
            profile={store.userProfile}
            onSave={store.updateProfile}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            settings={store.settings}
            onUpdate={store.updateSettings}
          />
        )}
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

