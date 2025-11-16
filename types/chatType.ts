export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  messages?: Message[];
  lastMessage?: Message | null;
  lastMessageAt?: string | Date;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  conversation: Conversation;
  user: {
    id: string;
    fullName: string;
    email?: string;
    profilePicture?: string | null;
  };
  lastReadAt?: string | Date | null;
}

export interface Message {
  id: string;
  content: string;
  conversationId: string;
  conversation?: Conversation;
  senderId: string;
  sender?: {
    id: string;
    fullName: string;
    email?: string;
    profilePicture?: string | null;
  };
  createdAt: string;
}

export interface CreateConversationDto {
  participantId: string;
}

export interface SendMessageDto {
  conversationId: string;
  content: string;
}



