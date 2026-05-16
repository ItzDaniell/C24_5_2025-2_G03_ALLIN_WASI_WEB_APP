"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import useConversations from "@/modules/landlord/data/queries/useConversations";
import useMessages from "@/modules/landlord/data/queries/useMessages";
import { useSendMessage, useMarkAsRead } from "@/modules/landlord/data/mutations/useChatActions";
import { Conversation, Message } from "@/types/chatType";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { MessageSquare, Search, Send, User } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/constants";
import { LoadingSpinner } from "@/modules/shared/components/LoadingSkeleton";
import { ViewHeader } from "../../ViewHeader";

const formatTime = (date: string | Date) => {
  const d = new Date(date);
  // Ajuste de +5h según solicitud del usuario para corregir desfase
  d.setHours(d.getHours() + 5);
  return d.toLocaleTimeString("es-PE", { 
    hour: "2-digit", 
    minute: "2-digit",
    timeZone: "America/Lima",
    hour12: false
  });
};

const formatDistanceToNow = (date: string | Date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "ahora";
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  if (diffDays < 7) return `hace ${diffDays} d`;
  return d.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
};

interface MessagesViewProps {
  onViewChange: (view: string) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function MessagesView({ onViewChange }: MessagesViewProps) {
  const { data: session } = useSession();
  const currentUserId = (session as any)?.user?.id || (session as any)?.accessToken?.sub;
  const accessToken = (session as any)?.accessToken;
  const { data: conversations, isLoading: loadingConversations } = useConversations();
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get('chatId');
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(initialChatId);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [messageContent, setMessageContent] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const socketRef = React.useRef<Socket | null>(null);
  const qc = useQueryClient();

  const { data: messages, isLoading: loadingMessages } = useMessages(selectedConversationId);
  const { mutate: sendMessage, isPending: sending } = useSendMessage();
  const { mutate: markAsRead } = useMarkAsRead();

  const sortedMessages = React.useMemo(() => {
    if (!messages || !Array.isArray(messages)) return [];
    return [...messages].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateA.getTime() - dateB.getTime();
    });
  }, [messages]);

  const selectedConversation = React.useMemo(() => {
    if (!selectedConversationId || !conversations) return null;
    return conversations.find((c) => c.id === selectedConversationId);
  }, [conversations, selectedConversationId]);

  const otherParticipant = React.useMemo(() => {
    if (!selectedConversation || !currentUserId) return null;
    const other = selectedConversation.participants?.find(
      (p) => p.user?.id !== currentUserId
    );
    return other?.user || null;
  }, [selectedConversation, currentUserId]);

  React.useEffect(() => {
    if (selectedConversationId && markAsRead) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, markAsRead]);

  React.useEffect(() => {
    if (!accessToken) return;
    const socket = io(`${API_BASE_URL}/chat`, {
      auth: { token: accessToken },
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("message:new", (msg: any) => {
      const convId = String(msg.conversationId || msg.conversation?.id || "");
      if (!convId) return;
      qc.invalidateQueries({ queryKey: ["messages", convId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, qc]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages]);

  const filteredConversations = React.useMemo(() => {
    if (!conversations) return [];
    if (!debouncedSearch.trim()) return conversations;
    const q = debouncedSearch.trim().toLowerCase();
    return conversations.filter((c) => {
      const participant = c.participants?.find((p) => p.user?.id !== currentUserId);
      const name = participant?.user?.fullName?.toLowerCase() || "";
      return name.includes(q);
    });
  }, [conversations, debouncedSearch, currentUserId]);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedConversationId || sending) return;
    const content = messageContent.trim();
    sendMessage(
      { conversationId: selectedConversationId, content },
      { onSuccess: () => setMessageContent("") }
    );
  };

  if (loadingConversations) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <ViewHeader 
        title="Mis Mensajes"
        description="Conversa con los arrendadores de tus habitaciones favoritas"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh] md:h-[75vh]">
        <Card className="border-au-lait flex flex-col h-full overflow-hidden gap-0">
          <div className="p-4 border-b border-au-lait">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lunar-eclipse" />
              <Input
                placeholder="Buscar chats..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation: Conversation) => {
              const participant = conversation.participants?.find((p) => p.user?.id !== currentUserId);
              const userName = participant?.user?.fullName || "Arrendador";

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`w-full p-4 flex items-center gap-4 transition-all relative group ${
                    selectedConversationId === conversation.id
                      ? "bg-emerald-50/60 text-emerald-900"
                      : "hover:bg-slate-50/80 text-inkwell bg-white border-b border-au-lait/20 last:border-0"
                  }`}
                >
                  {selectedConversationId === conversation.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[2px_0_10px_rgba(16,185,129,0.2)]" />
                  )}
                  <Avatar className="size-12 border border-au-lait/20 shrink-0">
                    <AvatarImage src={participant?.user?.profilePicture || undefined} />
                    <AvatarFallback className="bg-creme-brulee text-white flex items-center justify-center font-bold text-sm">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-sm font-bold text-inkwell truncate mr-2">{userName}</p>
                      {conversation.lastMessageAt && (
                        <span className="text-[11px] text-lunar-eclipse/70 font-medium shrink-0">
                          {formatDistanceToNow(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center gap-3">
                      <p className="text-xs text-lunar-eclipse truncate leading-relaxed">
                        {conversation.lastMessage?.content || "No hay mensajes aún"}
                      </p>
                      {(conversation.unreadCount ?? 0) > 0 && (
                        <Badge className="bg-creme-brulee text-white rounded-full h-5 min-w-5 px-1 flex items-center justify-center text-[10px] font-black shrink-0 border-none shadow-sm">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="border-au-lait flex flex-col h-full lg:col-span-2 overflow-hidden gap-0">
          {!selectedConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-lunar-eclipse opacity-50">
              <MessageSquare className="w-16 h-16 mb-4" />
              <p>Selecciona un chat para ver los mensajes</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-au-lait flex items-center gap-3 bg-white">
                <Avatar className="size-11 border border-au-lait">
                  <AvatarImage src={otherParticipant?.profilePicture || undefined} className="object-cover" />
                  <AvatarFallback className="bg-emerald-600 text-white font-semibold flex items-center justify-center">
                    {getInitials(otherParticipant?.fullName || "A")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-inkwell">{otherParticipant?.fullName}</p>
                  <p className="text-[11px] text-emerald-600 font-medium">En línea</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages?.map((message: Message) => {
                  const isMe = message.senderId === currentUserId;
                  return (
                    <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 px-4 rounded-2xl shadow-sm flex flex-col ${
                        isMe 
                          ? "bg-emerald-600 text-white rounded-tr-none" 
                          : "bg-white text-inkwell rounded-tl-none border border-au-lait/50"
                      }`}>
                        <p className="text-sm font-medium leading-relaxed">{message.content}</p>
                        <p className={`text-[10px] mt-1 self-end ${isMe ? "text-emerald-50" : "text-lunar-eclipse/60"}`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-au-lait bg-white">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="bg-creme-brulee hover:bg-creme-brulee/90 text-white">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
