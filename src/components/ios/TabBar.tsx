import React from 'react';
import { MessageSquare, Settings as SettingsIcon, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configuración', icon: SettingsIcon },
  ];

  return (
    <div className="ios-tab-blur fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around pb-6 px-2 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center w-full"
          >
            <Icon
              className={cn(
                "w-6 h-6 mb-1 transition-colors",
                isActive ? "text-ios-blue" : "text-ios-text-secondary dark:text-gray-400"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium",
                isActive ? "text-ios-blue" : "text-ios-text-secondary dark:text-gray-400"
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
