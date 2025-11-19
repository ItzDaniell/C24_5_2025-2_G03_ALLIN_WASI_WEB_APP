"use client";
import React from "react";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import useConversations from "@/modules/dashboard/data/queries/useConversations";
import useMessages from "@/modules/dashboard/data/queries/useMessages";
import { useSendMessage, useMarkAsRead } from "@/modules/dashboard/data/mutations/useChatActions";
import { Conversation, Message } from "@/types/chatType";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { MessageSquare, Search, Send, User } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/constants";
const formatTime = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
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
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);
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
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeA - timeB;
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
      qc.setQueryData(["messages", convId, 30, undefined], (prev: any) => {
        const list: Message[] = Array.isArray(prev) ? prev : [];
        if (list.find((m) => m.id === msg.id)) return list;
        const newList = [...list, msg];
        return newList.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return timeA - timeB;
        });
      });
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
      const participant = c.participants?.find((p) => p.user?.fullName);
      const name = participant?.user?.fullName?.toLowerCase() || "";
      const lastMessage = c.lastMessage?.content?.toLowerCase() || "";
      return name.includes(q) || lastMessage.includes(q);
    });
  }, [conversations, debouncedSearch]);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedConversationId || sending) return;
    const content = messageContent.trim();
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("message:send", {
        conversationId: selectedConversationId,
        content,
      });
      setMessageContent("");
    } else {
      sendMessage(
        {
          conversationId: selectedConversationId,
          content,
        },
        {
          onSuccess: () => {
            setMessageContent("");
          },
        }
      );
    }
  };
  if (loadingConversations) {
    return (
      <div className="space-y-6">
        <div className="text-lunar-eclipse">Cargando conversaciones...</div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mb-2 text-inkwell">Mensajes</h1>
          <p className="text-lunar-eclipse">Conversa con inquilinos interesados</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh] md:h-[85vh]">
        <Card className="border-au-lait flex flex-col h-full min-h-0">
          <CardContent className="p-0 flex flex-col h-full min-h-0">
            <div className="p-4 border-b border-au-lait">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-lunar-eclipse" />
                </span>
                <Input
                  placeholder="Buscar conversaciones"
                  className="pl-10 h-10 bg-white border-2 border-gray-200 rounded-lg pr-4 focus:border-creme-brulee focus:ring-2 focus:ring-creme-brulee focus:ring-opacity-20 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-lunar-eclipse text-sm">
                  No hay conversaciones
                </div>
              ) : (
                <div className="divide-y divide-au-lait">
                  {filteredConversations.map((conversation: Conversation) => {
                    const participant =
                      conversation.participants?.find((p) => p.user?.id !== currentUserId) ||
                      conversation.participants?.[0];
                    const userName = participant?.user?.fullName || "Usuario";
                    const userImage = participant?.user?.profilePicture;
                    const unreadCount = conversation.unreadCount || 0;
                    const isSelected = selectedConversationId === conversation.id;

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversationId(conversation.id)}
                        className={`w-full p-4 text-left hover:bg-au-lait transition-colors ${
                          isSelected ? "bg-creme-brulee bg-opacity-10" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={userImage || undefined} />
                            <AvatarFallback className="bg-creme-brulee text-white">
                              {getInitials(userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-inkwell truncate">
                                {userName}
                              </p>
                              {conversation.lastMessageAt && (
                                <span className="text-xs text-lunar-eclipse ml-2">
                                  {formatDistanceToNow(conversation.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-lunar-eclipse truncate">
                              {conversation.lastMessage?.content || "Sin mensajes"}
                            </p>
                          </div>
                          {unreadCount > 0 && (
                            <Badge className="bg-creme-brulee text-white">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="border-au-lait flex flex-col h-full lg:col-span-2 min-h-0">
          <CardContent className="p-0 flex flex-col h-full min-h-0">
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center text-lunar-eclipse">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-lunar-eclipse opacity-50" />
                  <p>Selecciona una conversación para ver los mensajes</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b border-au-lait">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={otherParticipant?.profilePicture || undefined} />
                      <AvatarFallback className="bg-creme-brulee text-white">
                        {otherParticipant ? getInitials(otherParticipant.fullName) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-inkwell">
                        {otherParticipant?.fullName || "Usuario"}
                      </p>
                      {otherParticipant?.email && (
                        <p className="text-xs text-lunar-eclipse">{otherParticipant.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="text-lunar-eclipse text-center">Cargando mensajes...</div>
                  ) : sortedMessages && sortedMessages.length > 0 ? (
                    sortedMessages.map((message: Message) => {
                      const senderId = String(message.senderId || message.sender?.id || "");
                      const meId = String(currentUserId || "");
                      const isOwnMessage = senderId === meId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] md:max-w-[60%] rounded-lg p-3 break-words whitespace-pre-wrap max-h-60 overflow-y-auto ${
                              isOwnMessage
                                ? "bg-creme-brulee text-white"
                                : "bg-au-lait text-inkwell"
                            }`}
                          >
                            {!isOwnMessage && message.sender && (
                              <p className="text-xs font-semibold mb-1">
                                {message.sender.fullName}
                              </p>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? "text-white opacity-70" : "text-lunar-eclipse"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-lunar-eclipse text-center">No hay mensajes aún</div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-au-lait">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribe un mensaje..."
                      className="flex-1"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      className="bg-creme-brulee text-white hover:bg-opacity-90"
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

