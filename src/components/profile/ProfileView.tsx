import React, { useState, useRef } from 'react';
import { UserProfile } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export function ProfileView({ profile, onSave }: ProfileViewProps) {
  const [name, setName] = useState(profile.name);
  const [description, setDescription] = useState(profile.description);
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result as string;
        setAvatar(newAvatar);
        onSave({ name, description, avatar: newAvatar });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlur = () => {
    onSave({ name, description, avatar });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <Avatar className="w-28 h-28 shadow-md border-2 border-white">
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-ios-blue text-white text-4xl">
              {name[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white w-10 h-10" />
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
          className="rounded-full text-xs h-8"
          onClick={() => fileInputRef.current?.click()}
        >
          Cambiar Foto de Perfil
        </Button>
      </div>

      <div className="bg-white rounded-xl p-4 space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <Label className="text-xs text-ios-text-secondary ml-1">Tu Nombre</Label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            onBlur={handleBlur}
            placeholder="Tu nombre en el roleplay"
            className="border-none px-0 focus-visible:ring-0 text-lg font-medium"
          />
        </div>
        
        <div className="h-px bg-gray-100" />

        <div className="space-y-1.5">
          <Label className="text-xs text-ios-text-secondary ml-1">Tu Descripción / Bio</Label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            onBlur={handleBlur}
            placeholder="Describe quién eres en las historias..."
            className="border-none px-0 focus-visible:ring-0 resize-none min-h-[100px]"
          />
        </div>
      </div>

      <p className="px-4 text-xs text-ios-text-secondary">
        Esta información será usada por la IA para saber cómo dirigirse a ti y entender tu contexto en el roleplay.
      </p>
    </div>
  );
}
