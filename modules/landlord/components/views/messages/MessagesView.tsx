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
import { useCreateReport } from "@/modules/tenant/data/mutations/useReportActions";
import { Conversation, Message } from "@/types/chatType";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { MessageSquare, Search, Send, User, Flag, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Textarea } from "@/ui/textarea";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/constants";
import { LoadingSpinner } from "@/modules/shared/components/LoadingSkeleton";
import { ViewHeader } from "@/modules/shared/components/ViewHeader";

const toDataUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  return value.startsWith("data:") || value.startsWith("http") ? value : `data:image/jpeg;base64,${value}`;
};

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
  // Ajuste de +5h según solicitud del usuario para corregir desfase y mostrar la hora peruana (UTC-5)
  d.setHours(d.getHours() + 5);
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

const getDateLabel = (date: string | Date): string => {
  try {
    const d = new Date(date);
    d.setHours(d.getHours() + 5);
    
    // Normalizamos a la fecha local (America/Lima) sin hora para comparar
    const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const yesterdayMidnight = new Date(todayMidnight);
    yesterdayMidnight.setDate(todayMidnight.getDate() - 1);

    if (msgDate.getTime() === todayMidnight.getTime()) return "Hoy";
    if (msgDate.getTime() === yesterdayMidnight.getTime()) return "Ayer";

    return d.toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "America/Lima",
    });
  } catch {
    return "";
  }
};

const getDateKey = (date: string | Date): string => {
  try {
    const d = new Date(date);
    d.setHours(d.getHours() + 5);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  } catch {
    return "";
  }
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

function ReportDialog({ otherParticipantName, otherParticipantId, conversationId }: { otherParticipantName: string, otherParticipantId: string, conversationId: string | null }) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);
  const { mutate: createReport, isPending: isSubmitting } = useCreateReport();

  const handleSubmit = () => {
    if (!reason.trim() || !otherParticipantId) return;
    createReport(
      { reportedUserId: otherParticipantId, conversationId: conversationId || undefined, reason },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            setOpen(false);
            setTimeout(() => { setIsSuccess(false); setReason(""); }, 300);
          }, 2000);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-lunar-eclipse hover:text-red-600 hover:bg-red-50" title="Reportar problema">
          <Flag className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Reportar un problema
          </DialogTitle>
          <DialogDescription className="text-left">
            Si tienes algún inconveniente con <span className="font-semibold">{otherParticipantName}</span>, descríbelo a continuación. Nuestro equipo revisará el caso.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-6 text-center text-emerald-600 font-medium bg-emerald-50 rounded-lg">
            ¡Tu reporte ha sido enviado con éxito! Lo revisaremos pronto.
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <Textarea 
              placeholder="Ej. El estudiante presenta un comportamiento inadecuado, falta a las reglas, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
        )}

        {!isSuccess && (
          <DialogFooter className="sm:justify-end gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleSubmit} 
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? "Enviando..." : "Enviar Reporte"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

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

  const [isOtherOnline, setIsOtherOnline] = React.useState(false);
  const [otherLastActiveAt, setOtherLastActiveAt] = React.useState<Date | null>(null);
  const currentOtherIdRef = React.useRef<string | null>(null);

  const { data: messages, isLoading: loadingMessages } = useMessages(selectedConversationId);
  const { mutate: sendMessage, isPending: sending } = useSendMessage();
  const { mutate: markAsRead } = useMarkAsRead();

  const sortedMessages = React.useMemo(() => {
    if (!messages || !Array.isArray(messages)) return [];
    return [...messages].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      const timeA = dateA.getTime();
      const timeB = dateB.getTime();
      if (timeA === timeB) {
        return String(a.id || '').localeCompare(String(b.id || ''));
      }
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
    currentOtherIdRef.current = otherParticipant?.id || null;
    if (otherParticipant) {
      const activeAt = (otherParticipant as any).lastActiveAt || (otherParticipant as any).updatedAt || (otherParticipant as any).createdAt;
      if (activeAt) setOtherLastActiveAt(new Date(activeAt));
      else setOtherLastActiveAt(null);
      setIsOtherOnline(false);

      if (socketRef.current?.connected) {
        socketRef.current.emit('user:status:get', { userId: otherParticipant.id }, (res: any) => {
          if (res?.userId === currentOtherIdRef.current) {
            setIsOtherOnline(res.isOnline);
            if (res.lastActiveAt) setOtherLastActiveAt(new Date(res.lastActiveAt));
          }
        });
      }
    }
  }, [otherParticipant]);

  React.useEffect(() => {
    if (!accessToken) return;
    const socket = io(`${API_BASE_URL}/chat`, {
      auth: { token: accessToken },
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (currentOtherIdRef.current) {
        socket.emit('user:status:get', { userId: currentOtherIdRef.current }, (res: any) => {
          if (res?.userId === currentOtherIdRef.current) {
            setIsOtherOnline(res.isOnline);
            if (res.lastActiveAt) setOtherLastActiveAt(new Date(res.lastActiveAt));
          }
        });
      }
    });

    socket.on("user:status", (data: { userId: string, isOnline: boolean, lastActiveAt?: string }) => {
      if (currentOtherIdRef.current === data.userId) {
        setIsOtherOnline(data.isOnline);
        if (data.lastActiveAt) {
          setOtherLastActiveAt(new Date(data.lastActiveAt));
        }
      }
    });

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
        title="Mensajes"
        description="Conversa con inquilinos interesados en tus habitaciones"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh] md:h-[85vh]">
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
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-lunar-eclipse/60 text-sm font-medium">
                No hay contactos
              </div>
            ) : (
              filteredConversations.map((conversation: Conversation) => {
                const participant = conversation.participants?.find((p) => p.user?.id !== currentUserId);
                const userName = participant?.user?.fullName || "Inquilino";

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
                      <AvatarImage
                        src={toDataUrl(participant?.user?.profilePicture)}
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
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
              })
            )}
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
              <div className="p-4 border-b border-au-lait flex items-center gap-4 bg-white/50 backdrop-blur-sm">
                <Avatar className="size-14 border-2 border-creme-brulee shadow-md flex-shrink-0">
                  <AvatarImage
                    src={toDataUrl(otherParticipant?.profilePicture)}
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-creme-brulee to-emerald-500 text-white font-semibold flex items-center justify-center text-lg">
                    {getInitials(otherParticipant?.fullName || "E")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-base font-bold text-inkwell">{otherParticipant?.fullName}</p>
                  {isOtherOnline ? (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      En línea
                    </span>
                  ) : otherLastActiveAt ? (
                    <span className="text-[11px] text-lunar-eclipse font-medium">
                      Activo {formatDistanceToNow(otherLastActiveAt)}
                    </span>
                  ) : null}
                </div>
                <ReportDialog 
                  otherParticipantName={otherParticipant?.fullName || "Usuario"}
                  otherParticipantId={otherParticipant?.id || ""}
                  conversationId={selectedConversationId} 
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : sortedMessages && sortedMessages.length > 0 ? (
                  sortedMessages.map((message: Message, index: number) => {
                    const currentDateKey = getDateKey(message.createdAt);
                    const prevDateKey = index > 0 ? getDateKey(sortedMessages[index - 1].createdAt) : null;
                    const showDateDivider = currentDateKey !== prevDateKey;
                    const isMe = message.senderId === currentUserId;
                    return (
                      <React.Fragment key={message.id}>
                        {showDateDivider && (
                          <div className="flex items-center gap-3 my-2 justify-center w-full">
                            <div className="flex-1 h-px bg-au-lait/60" />
                            <span className="text-xs text-lunar-eclipse font-medium bg-au-lait/30 px-3 py-1 rounded-full whitespace-nowrap">
                              {getDateLabel(message.createdAt)}
                            </span>
                            <div className="flex-1 h-px bg-au-lait/60" />
                          </div>
                        )}
                        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] p-3 px-4 rounded-2xl shadow-sm flex flex-col ${
                            isMe 
                              ? "bg-emerald-600 text-white rounded-tr-none" 
                              : "bg-white text-inkwell rounded-tl-none border border-au-lait/50"
                          }`}>
                            <p className="text-sm font-medium leading-relaxed break-words text-left">{message.content}</p>
                            <p className={`text-[10px] mt-1 self-end ${isMe ? "text-emerald-50" : "text-lunar-eclipse/60"}`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="text-lunar-eclipse text-center py-8">No hay mensajes aún</div>
                )}
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
