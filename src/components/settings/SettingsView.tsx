import React, { useRef } from 'react';
import { Settings } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, Type, Image as ImageIcon, Key, Moon, Sun, Palette, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsViewProps {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
}

export function SettingsView({ settings, onUpdate }: SettingsViewProps) {
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ chatBackground: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className={cn(
        "rounded-xl overflow-hidden shadow-sm",
        settings.darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      )}>
        {/* Dark Mode */}
        <div className={cn(
          "p-4 flex items-center justify-between border-b",
          settings.darkMode ? "border-gray-700" : "border-gray-100"
        )}>
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-1.5 rounded-lg text-white",
              settings.darkMode ? "bg-indigo-600" : "bg-indigo-500"
            )}>
              {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium">Modo Oscuro</p>
              <p className={cn(
                "text-xs",
                settings.darkMode ? "text-gray-400" : "text-ios-text-secondary"
              )}>Cambia el tema de la aplicación</p>
            </div>
          </div>
          <Switch 
            checked={settings.darkMode} 
            onCheckedChange={(val) => onUpdate({ darkMode: val })} 
          />
        </div>

        {/* Chat Background */}
        <div className={cn(
          "p-4 flex items-center justify-between border-b",
          settings.darkMode ? "border-gray-700" : "border-gray-100"
        )}>
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Fondo de Chat</p>
              <p className={cn(
                "text-xs",
                settings.darkMode ? "text-gray-400" : "text-ios-text-secondary"
              )}>Personaliza el fondo de tus conversaciones</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {settings.chatBackground && (
              <button 
                onClick={() => onUpdate({ chatBackground: undefined })}
                className="text-xs text-red-500 font-medium"
              >
                Reset
              </button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full h-8 text-xs"
              onClick={() => bgInputRef.current?.click()}
            >
              Cambiar
            </Button>
            <input 
              type="file" 
              ref={bgInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleBgUpload} 
            />
          </div>
        </div>

        <div className={cn(
          "p-4 flex items-center justify-between border-b",
          settings.darkMode ? "border-gray-700" : "border-gray-100"
        )}>
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Modo NSFW</p>
              <p className={cn(
                "text-xs",
                settings.darkMode ? "text-gray-400" : "text-ios-text-secondary"
              )}>Libera lo esencial para roleplay</p>
            </div>
          </div>
          <Switch 
            checked={settings.nsfwMode} 
            onCheckedChange={(val) => onUpdate({ nsfwMode: val })} 
          />
        </div>

        <div className={cn(
          "p-4 flex items-center justify-between border-b",
          settings.darkMode ? "border-gray-700" : "border-gray-100"
        )}>
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-1.5 rounded-lg text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Super Modo NSFW</p>
              <p className={cn(
                "text-xs",
                settings.darkMode ? "text-gray-400" : "text-ios-text-secondary"
              )}>Sin censura al 100% (Requiere API Key)</p>
            </div>
          </div>
          <Switch 
            checked={settings.superNsfwMode} 
            onCheckedChange={(val) => onUpdate({ superNsfwMode: val })} 
          />
        </div>

        {settings.superNsfwMode && (
          <div className={cn(
            "p-4 space-y-2 border-b",
            settings.darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100"
          )}>
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase">
              <Key className="w-3 h-3" />
              <span>API Key Personal (NSFW)</span>
            </div>
            <Input 
              type="password" 
              placeholder="Pega tu API Key aquí" 
              value={settings.customApiKey || ''}
              onChange={(e) => onUpdate({ customApiKey: e.target.value })}
              className={cn(
                "border-none",
                settings.darkMode ? "bg-gray-800 text-white" : "bg-white"
              )}
            />
          </div>
        )}

        <div className={cn(
          "p-4 flex items-center justify-between border-b",
          settings.darkMode ? "border-gray-700" : "border-gray-100"
        )}>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-1.5 rounded-lg text-white">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Escritura Corta</p>
              <p className={cn(
                "text-xs",
                settings.darkMode ? "text-gray-400" : "text-ios-text-secondary"
              )}>La IA responderá de forma breve</p>
            </div>
          </div>
          <Switch 
            checked={settings.shortWriting} 
            onCheckedChange={(val) => onUpdate({ shortWriting: val })} 
          />
        </div>

        <div className={cn(
          "p-4 flex items-center justify-between border-b",
          settings.darkMode ? "border-gray-700" : "border-gray-100"
        )}>
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 p-1.5 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Mensajes Automáticos</p>
              <p className={cn(
                "text-xs",
                settings.darkMode ? "text-gray-400" : "text-ios-text-secondary"
              )}>Las IAs te escribirán por su cuenta</p>
            </div>
          </div>
          <Switch 
            checked={settings.autoMessages} 
            onCheckedChange={(val) => onUpdate({ autoMessages: val })} 
          />
        </div>

        {/* AI Images vs Super Images */}
        {!settings.superImages ? (
          <div className={cn(
            "p-4 flex items-center justify-between border-b",
            settings.darkMode ? "border-gray-700" : "border-gray-100"
          )}>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 p-1.5 rounded-lg text-white">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Imágenes IA</p>
                <p className={cn(
                  "text-xs",
                  settings.darkMode ? "text-gray-400" : "text-ios-text-secondary"
                )}>Activa generación de imágenes</p>
              </div>
            </div>
            <Switch 
              checked={settings.aiImages} 
              onCheckedChange={(val) => onUpdate({ aiImages: val })} 
            />
          </div>
        ) : null}

        <div className={cn(
          "p-4 flex items-center justify-between",
          settings.superImages && "border-b border-gray-100"
        )}>
          <div className="flex items-center space-x-3">
            <div className="bg-pink-500 p-1.5 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Super Imágenes</p>
              <p className={cn(
                "text-xs",
                settings.darkMode ? "text-gray-400" : "text-ios-text-secondary"
              )}>Generación avanzada (Requiere API Key)</p>
            </div>
          </div>
          <Switch 
            checked={settings.superImages} 
            onCheckedChange={(val) => {
              onUpdate({ superImages: val, aiImages: val ? false : settings.aiImages });
            }} 
          />
        </div>

        {settings.superImages && (
          <div className={cn(
            "p-4 space-y-2",
            settings.darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100"
          )}>
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase">
              <Key className="w-3 h-3" />
              <span>API Key para Super Imágenes</span>
            </div>
            <Input 
              type="password" 
              placeholder="Pega tu API Key aquí" 
              value={settings.superImagesApiKey || ''}
              onChange={(e) => onUpdate({ superImagesApiKey: e.target.value })}
              className={cn(
                "border-none",
                settings.darkMode ? "bg-gray-800 text-white" : "bg-white"
              )}
            />
          </div>
        )}
      </div>

      <div className={cn(
        "px-4 text-xs text-center",
        settings.darkMode ? "text-gray-500" : "text-ios-text-secondary"
      )}>
        <p>Esta aplicación funciona de manera local.</p>
        <p>Tus chats y personajes se guardan en este navegador.</p>
      </div>
    </div>
  );
}
