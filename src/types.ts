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
}

export interface Message {
  id: string;
  senderId: string; // 'user' or characterId
  senderName: string;
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
  customApiKey?: string;
}
