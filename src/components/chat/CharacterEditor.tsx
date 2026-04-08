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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    });
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
              <Label className="dark:text-gray-300">Miembros del Grupo</Label>
              <div className="grid grid-cols-2 gap-2">
                {characters.filter(c => !c.isGroup).map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggleMember(c.id)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border text-sm transition-colors ${
                      memberIds.includes(c.id) 
                        ? 'bg-ios-blue/10 border-ios-blue dark:bg-ios-blue/20' 
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={c.avatar} />
                      <AvatarFallback>{c.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
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
