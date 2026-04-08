export interface Character {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  personality: string;
  scenario: string;
  firstMessage: string;
  isGroup?: boolean;
  memberIds?: string[]; // For groups
  suspendedMemberIds?: string[]; // For suspended members in groups
  chatStyle: 'whatsapp' | 'roleplay';
  voiceSettings?: {
    gender: 'male' | 'female';
    tone: 'sweet' | 'deep';
    sampleAudio?: string; // Base64
  };
}

export interface Message {
  id: string;
  senderId: string; // 'user' or characterId
  senderName: string;
  senderAvatar?: string; // For groups
  text: string;
  timestamp: number;
  image?: string; // Base64 or local URL
}

export interface Chat {
  id: string;
  characterId: string; // or groupId
  messages: Message[];
  lastMessage?: string;
  lastTimestamp?: number;
  unreadCount: number;
}

export interface UserProfile {
  name: string;
  avatar?: string;
  description: string;
}

export interface Settings {
  nsfwMode: boolean;
  superNsfwMode: boolean;
  shortWriting: boolean;
  aiImages: boolean;
  superImages: boolean;
  darkMode: boolean;
  autoMessages: boolean;
  betaCallMode: boolean;
  chatBackground?: string;
  customApiKey?: string;
  superImagesApiKey?: string;
}
