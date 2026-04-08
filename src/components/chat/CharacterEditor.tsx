import React, { useState, useRef } from 'react';
import { Character } from '@/types';
import { NavBar } from '../ios/NavBar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, Users, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterEditorProps {
  character: Character | null;
  characters: Character[];
  onSave: (char: Character) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}

export function CharacterEditor({ character, characters, onSave, onCancel, onDelete }: CharacterEditorProps) {
  const [name, setName] = useState(character?.name || '');
  const [description, setDescription] = useState(character?.description || '');
  const [personality, setPersonality] = useState(character?.personality || '');
  const [scenario, setScenario] = useState(character?.scenario || '');
  const [firstMessage, setFirstMessage] = useState(character?.firstMessage || '');
  const [avatar, setAvatar] = useState(character?.avatar || '');
  const [isGroup, setIsGroup] = useState(character?.isGroup || false);
  const [chatStyle, setChatStyle] = useState<'whatsapp' | 'roleplay'>(character?.chatStyle || 'whatsapp');
  const [memberIds, setMemberIds] = useState<string[]>(character?.memberIds || []);
  const [suspendedMemberIds, setSuspendedMemberIds] = useState<string[]>(character?.suspendedMemberIds || []);
  const [voiceSettings, setVoiceSettings] = useState<{
    gender: 'male' | 'female';
    tone: 'sweet' | 'deep';
    sampleAudio?: string;
  }>(character?.voiceSettings || { gender: 'female', tone: 'sweet' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: character?.id || Date.now().toString(),
      name,
      description,
      personality,
      scenario,
      firstMessage,
      avatar,
      isGroup,
      chatStyle,
      memberIds: isGroup ? memberIds : undefined,
      suspendedMemberIds: isGroup ? suspendedMemberIds : undefined,
      voiceSettings: !isGroup ? voiceSettings : undefined,
    });
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoiceSettings(prev => ({ ...prev, sampleAudio: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMember = (id: string) => {
    setMemberIds(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-ios-bg dark:bg-black z-[70] overflow-y-auto pb-20">
      <NavBar
        title={character ? 'Editar Personaje' : 'Nuevo Personaje'}
        onBack={onCancel}
        rightAction={
          <button onClick={handleSave} className="text-ios-blue font-semibold">
            Guardar
          </button>
        }
      />

      <div className="pt-28 px-4 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar className="w-24 h-24 border-2 border-white dark:border-gray-800 shadow-sm">
              <AvatarImage src={avatar} />
              <AvatarFallback className="bg-ios-blue text-white text-3xl">
                {name[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white w-8 h-8" />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full text-xs h-8 dark:border-gray-700 dark:text-gray-300"
            onClick={() => fileInputRef.current?.click()}
          >
            Cambiar Foto
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-4 shadow-sm">
          <div className="space-y-1.5">
            <Label className="dark:text-gray-300">Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Elena" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="dark:text-gray-300">¿Es un grupo?</Label>
              <p className="text-xs text-ios-text-secondary dark:text-gray-500">Permite juntar varias IAs</p>
            </div>
            <Switch checked={isGroup} onCheckedChange={setIsGroup} />
          </div>

          {isGroup && (
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Integrantes y Suspensión</Label>
              <div className="space-y-2">
                {characters.filter(c => !c.isGroup).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={memberIds.includes(c.id)}
                        onChange={() => toggleMember(c.id)}
                        className="w-4 h-4 rounded border-gray-300 text-ios-blue focus:ring-ios-blue"
                      />
                      <span className="text-sm dark:text-white">{c.name}</span>
                    </div>
                    {memberIds.includes(c.id) && (
                      <button
                        onClick={() => {
                          if (suspendedMemberIds.includes(c.id)) {
                            setSuspendedMemberIds(suspendedMemberIds.filter(id => id !== c.id));
                          } else {
                            setSuspendedMemberIds([...suspendedMemberIds, c.id]);
                          }
                        }}
                        className={cn(
                          "text-[10px] px-2 py-1 rounded-full border transition-colors",
                          suspendedMemberIds.includes(c.id)
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-green-500 text-white border-green-500"
                        )}
                      >
                        {suspendedMemberIds.includes(c.id) ? "Suspendido" : "Activo"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isGroup && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
              <Label className="dark:text-gray-300 font-bold">Configuración de Voz (Beta)</Label>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] dark:text-gray-400">Género</Label>
                  <select 
                    value={voiceSettings.gender}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-1.5 text-xs dark:text-white"
                  >
                    <option value="female">Femenina</option>
                    <option value="male">Masculina</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] dark:text-gray-400">Tono</Label>
                  <select 
                    value={voiceSettings.tone}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, tone: e.target.value as any }))}
                    className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-1.5 text-xs dark:text-white"
                  >
                    <option value="sweet">Dulce</option>
                    <option value="deep">Grave</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] dark:text-gray-400">Audio de Ejemplo (Opcional)</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] flex-1"
                    onClick={() => audioInputRef.current?.click()}
                  >
                    {voiceSettings.sampleAudio ? "Cambiar Audio" : "Subir Audio"}
                  </Button>
                  {voiceSettings.sampleAudio && (
                    <button onClick={() => setVoiceSettings(prev => ({ ...prev, sampleAudio: undefined }))} className="text-red-500 text-[10px]">Borrar</button>
                  )}
                  <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={handleAudioUpload} />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="dark:text-gray-300">Estilo de Chat</Label>
            <div className="flex space-x-2">
              <button
                onClick={() => setChatStyle('whatsapp')}
                className={cn(
                  "flex-1 py-2 rounded-lg border text-sm transition-colors",
                  chatStyle === 'whatsapp' 
                    ? "bg-ios-blue text-white border-ios-blue" 
                    : "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                )}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setChatStyle('roleplay')}
                className={cn(
                  "flex-1 py-2 rounded-lg border text-sm transition-colors",
                  chatStyle === 'roleplay' 
                    ? "bg-ios-blue text-white border-ios-blue" 
                    : "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                )}
              >
                Roleplay Clásico
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="dark:text-gray-300">Descripción Corta</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Una bibliotecaria misteriosa" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" />
          </div>

          <div className="space-y-1.5">
            <Label className="dark:text-gray-300">Personalidad</Label>
            <Textarea 
              value={personality} 
              onChange={(e) => setPersonality(e.target.value)} 
              placeholder="Describe cómo actúa, habla y piensa..."
              rows={3}
              className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="dark:text-gray-300">Escenario</Label>
            <Textarea 
              value={scenario} 
              onChange={(e) => setScenario(e.target.value)} 
              placeholder="¿Dónde están? ¿Qué está pasando?"
              rows={2}
              className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="dark:text-gray-300">Primer Mensaje</Label>
            <Textarea 
              value={firstMessage} 
              onChange={(e) => setFirstMessage(e.target.value)} 
              placeholder="Lo que dirá al iniciar el chat"
              rows={2}
              className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
            />
          </div>
        </div>

        {character && (
          <Button 
            variant="destructive" 
            className="w-full rounded-xl"
            onClick={() => onDelete(character.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Personaje
          </Button>
        )}
      </div>
    </div>
  );
}
