import React from 'react';
import { Settings } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, ShieldAlert, Type, Image as ImageIcon, Key } from 'lucide-react';

interface SettingsViewProps {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
}

export function SettingsView({ settings, onUpdate }: SettingsViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Modo NSFW</p>
              <p className="text-xs text-ios-text-secondary">Libera lo esencial para roleplay</p>
            </div>
          </div>
          <Switch 
            checked={settings.nsfwMode} 
            onCheckedChange={(val) => onUpdate({ nsfwMode: val })} 
          />
        </div>

        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-1.5 rounded-lg text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Super Modo NSFW</p>
              <p className="text-xs text-ios-text-secondary">Sin censura al 100% (Requiere API Key)</p>
            </div>
          </div>
          <Switch 
            checked={settings.superNsfwMode} 
            onCheckedChange={(val) => onUpdate({ superNsfwMode: val })} 
          />
        </div>

        {settings.superNsfwMode && (
          <div className="p-4 bg-gray-50 space-y-2 border-b border-gray-100">
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase">
              <Key className="w-3 h-3" />
              <span>API Key Personal</span>
            </div>
            <Input 
              type="password" 
              placeholder="Pega tu API Key aquí" 
              value={settings.customApiKey || ''}
              onChange={(e) => onUpdate({ customApiKey: e.target.value })}
              className="bg-white"
            />
          </div>
        )}

        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-1.5 rounded-lg text-white">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Escritura Corta</p>
              <p className="text-xs text-ios-text-secondary">La IA responderá de forma breve</p>
            </div>
          </div>
          <Switch 
            checked={settings.shortWriting} 
            onCheckedChange={(val) => onUpdate({ shortWriting: val })} 
          />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-1.5 rounded-lg text-white">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Imágenes IA</p>
              <p className="text-xs text-ios-text-secondary">Activa generación de imágenes</p>
            </div>
          </div>
          <Switch 
            checked={settings.aiImages} 
            onCheckedChange={(val) => onUpdate({ aiImages: val })} 
          />
        </div>
      </div>

      <div className="px-4 text-xs text-ios-text-secondary text-center">
        <p>Esta aplicación funciona de manera local.</p>
        <p>Tus chats y personajes se guardan en este navegador.</p>
      </div>
    </div>
  );
}
