"use client";
import React from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { useAiMessages, AiMessage } from "@/modules/dashboard/data/queries/useAiChat";
import { useSendAiMessage } from "@/modules/dashboard/data/mutations/useAiChat";
import { Bot, Send, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/ui/avatar";

interface AiChatAreaProps {
  conversationId: string | null;
  conversationTitle?: string;
  onConversationCreated?: (conversationId: string, title?: string) => void;
  onNewConversation?: () => void;
  showHeader?: boolean;
  className?: string;
  compact?: boolean;
}

const formatTime = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

export function AiChatArea({
  conversationId,
  conversationTitle,
  onConversationCreated,
  onNewConversation,
  showHeader = true,
  className = "",
  compact = false,
}: AiChatAreaProps) {
  const [messageContent, setMessageContent] = React.useState("");
  const [pendingUserMessage, setPendingUserMessage] = React.useState<string | null>(null);
  const [streamingText, setStreamingText] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [tempConversationId, setTempConversationId] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { mutate: sendMessage } = useSendAiMessage();
  
  const activeConversationId = conversationId || tempConversationId;
  const { data: messagesData, isLoading: loadingMessages, refetch: refetchMessages } = useAiMessages(activeConversationId);
  
  const messages = React.useMemo(() => {
    const baseMessages = messagesData?.messages || [];
    const result = [...baseMessages];
    
    if (pendingUserMessage) {
      const userMessageExists = baseMessages.some(
        (msg) => msg.role === 'user' && msg.content === pendingUserMessage
      );
      if (!userMessageExists) {
        result.push({
          id: 'pending-user',
          role: 'user' as const,
          content: pendingUserMessage,
          createdAt: new Date().toISOString(),
        } as AiMessage);
      }
    }
    
    if (streamingText) {
      const existingIndex = result.findIndex(m => m.id === 'streaming');
      if (existingIndex >= 0) {
        result[existingIndex] = {
          id: 'streaming',
          role: 'model' as const,
          content: streamingText,
          createdAt: new Date().toISOString(),
        } as AiMessage;
      } else {
        result.push({
          id: 'streaming',
          role: 'model' as const,
          content: streamingText,
          createdAt: new Date().toISOString(),
        } as AiMessage);
      }
    }
    
    return result;
  }, [messagesData?.messages, pendingUserMessage, streamingText]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || isStreaming) return;

    const userMessage = messageContent.trim();
    setPendingUserMessage(userMessage);
    setMessageContent("");
    setStreamingText("");
    setIsStreaming(true);

    const payload = {
      conversationId: conversationId || undefined,
      messages: [{ role: 'user' as const, content: userMessage }],
    };

    sendMessage(payload, {
      onChunk: (chunk: string, metadata?: any) => {
        if (metadata?.type === 'conversation_created') {
          if (metadata?.conversationId) {
            setTempConversationId(metadata.conversationId);
            onConversationCreated?.(metadata.conversationId, metadata?.title);
          }
        } else if (chunk) {
          setStreamingText((prev) => {
            return prev + chunk;
          });
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }
      },
      onSuccess: (data) => {
        setPendingUserMessage(null);
        setIsStreaming(false);
        if (data.conversationId) {
          setTempConversationId(null);
          refetchMessages().then(() => {
            setTimeout(() => {
              setStreamingText("");
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          });
        } else {
          setTimeout(() => {
            setStreamingText("");
          }, 100);
        }
      },
      onError: () => {
        setPendingUserMessage(null);
        setStreamingText("");
        setIsStreaming(false);
        setMessageContent(userMessage);
      },
    });
  };

  React.useEffect(() => {
    if (!conversationId) {
      setTempConversationId(null);
      setMessageContent("");
      setPendingUserMessage(null);
      setStreamingText("");
      setIsStreaming(false);
    }
  }, [conversationId]);

  return (
    <Card className={`flex-1 flex flex-col border-au-lait min-h-0 shadow-sm ${className}`}>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {(activeConversationId || pendingUserMessage) ? (
          <>
            {showHeader && (
              <div className="p-5 border-b border-au-lait flex items-center gap-4 bg-gradient-to-r from-creme-brulee/5 to-transparent">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-inkwell text-lg">{conversationTitle || 'Nueva conversación'}</h3>
                  <p className="text-sm text-lunar-eclipse mt-0.5">Asistente Inteligente</p>
                </div>
              </div>
            )}

            <div className={`flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-white to-au-lait/10 ${compact ? 'p-3 space-y-3' : 'p-6 space-y-5'}`}>
              {loadingMessages ? (
                <div className="text-center text-lunar-eclipse py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-creme-brulee"></div>
                  <p className="mt-3">Cargando mensajes...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-lunar-eclipse py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-lunar-eclipse opacity-50" />
                  </div>
                  <p className="text-sm font-medium text-inkwell mb-2">¡Hola! Soy tu asistente inteligente</p>
                  <p className="text-xs text-lunar-eclipse max-w-sm mx-auto">
                    Tengo acceso a tus propiedades, solicitudes, mensajes y archivos en tiempo real. También te ayudo con dudas sobre la plataforma.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg: AiMessage) => (
                    <div
                      key={msg.id}
                      className={`flex ${compact ? 'gap-2' : 'gap-3'} ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      {msg.role === 'model' && (
                        <Avatar className={`${compact ? 'w-7 h-7' : 'w-9 h-9'} shrink-0 shadow-sm`}>
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                            <Bot className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`${compact ? 'max-w-[80%] rounded-xl p-2.5' : 'max-w-[75%] rounded-2xl p-4'} shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-creme-brulee text-white rounded-tr-sm'
                            : 'bg-white text-inkwell border border-au-lait rounded-tl-sm'
                        }`}
                      >
                        {msg.content && msg.content.trim() ? (
                          <p className={`${compact ? 'text-xs' : 'text-sm'} leading-relaxed whitespace-pre-wrap`}>{msg.content}</p>
                        ) : (
                          <p className={`${compact ? 'text-xs' : 'text-sm'} text-lunar-eclipse italic`}>Mensaje vacío</p>
                        )}
                        <p className={`${compact ? 'text-[10px] mt-1' : 'text-xs mt-2'} ${msg.role === 'user' ? 'text-white/70' : 'text-lunar-eclipse'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <Avatar className={`${compact ? 'w-7 h-7' : 'w-9 h-9'} shrink-0 shadow-sm`}>
                          <AvatarFallback className="bg-lunar-eclipse text-white font-medium">
                            Tú
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isStreaming && !pendingUserMessage && !streamingText && (
                    <div className={`flex ${compact ? 'gap-2' : 'gap-3'} justify-start`}>
                      <Avatar className={`${compact ? 'w-7 h-7' : 'w-9 h-9'} shrink-0 shadow-sm`}>
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                          <Bot className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
                        </AvatarFallback>
                      </Avatar>
                      <div className={`bg-white text-inkwell ${compact ? 'rounded-xl rounded-tl-sm p-2.5' : 'rounded-2xl rounded-tl-sm p-4'} shadow-sm border border-au-lait`}>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-lunar-eclipse rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-lunar-eclipse rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-lunar-eclipse rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          {!compact && <span className="text-sm text-lunar-eclipse ml-1">Escribiendo...</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={`border-t border-au-lait bg-white shrink-0 ${compact ? 'p-3' : 'p-5'}`}>
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe tu pregunta..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className={`flex-1 border-au-lait focus:border-creme-brulee focus:ring-creme-brulee ${compact ? 'text-sm' : ''}`}
                  disabled={isStreaming}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || isStreaming}
                  className={`bg-creme-brulee text-white hover:bg-creme-brulee/90 shadow-md hover:shadow-lg transition-all ${compact ? 'px-4' : 'px-6'}`}
                  size={compact ? 'sm' : 'default'}
                >
                  {isStreaming ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {compact ? '' : 'Enviando...'}
                    </span>
                  ) : (
                    <>
                      <Send className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
                      {!compact && 'Enviar'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white via-au-lait/5 to-white ${compact ? 'p-4' : 'p-8'}`}>
            <div className={`relative ${compact ? 'mb-3' : 'mb-5'}`}>
              <div className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg`}>
                <Sparkles className={`${compact ? 'w-7 h-7' : 'w-10 h-10'} text-white`} />
              </div>
              <div className={`absolute -top-1 -right-1 ${compact ? 'w-4 h-4' : 'w-5 h-5'} bg-creme-brulee rounded-full animate-pulse`}></div>
            </div>
            
            <h2 className={`font-bold text-inkwell ${compact ? 'text-lg mb-1' : 'text-2xl mb-2'}`}>
              {compact ? '¡Hola!' : 'Asistente Inteligente'}
            </h2>
            <p className={`text-lunar-eclipse ${compact ? 'text-xs mb-4 px-2' : 'text-sm mb-6 max-w-md'} leading-relaxed`}>
              {compact 
                ? 'Consulto tus datos en tiempo real: propiedades, solicitudes, mensajes y archivos' 
                : 'Pregúntame sobre tus propiedades, solicitudes, mensajes, archivos o cómo usar la plataforma. Tengo acceso a toda tu información en tiempo real.'}
            </p>

            {compact ? (
              <div className="w-full mb-4 space-y-2">
                <p className="text-[10px] font-medium text-lunar-eclipse mb-2">Prueba preguntar:</p>
                {[
                  "¿Cuántas propiedades tengo?",
                  "¿Tengo mensajes sin leer?",
                ].map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessageContent(question)}
                    className="w-full text-left p-2 rounded-lg border border-au-lait hover:border-creme-brulee hover:bg-creme-brulee/5 transition-all text-xs text-inkwell"
                  >
                    <span className="text-creme-brulee mr-1.5">→</span>
                    {question}
                  </button>
                ))}
              </div>
            ) : (
              <div className="w-full max-w-2xl mb-6">
                <p className="text-xs font-medium text-lunar-eclipse mb-3 text-left">Ejemplos de preguntas:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "¿Cuántas propiedades tengo disponibles?",
                    "¿Tengo solicitudes pendientes?",
                    "¿Cuántos mensajes sin leer tengo?",
                    "¿Cuántos archivos he subido?",
                  ].map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMessageContent(question)}
                      className="text-left p-3 rounded-lg border border-au-lait hover:border-creme-brulee hover:bg-creme-brulee/5 transition-all text-sm text-inkwell hover:shadow-sm"
                    >
                      <span className="text-creme-brulee mr-2">→</span>
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={`w-full ${compact ? 'space-y-2' : 'max-w-2xl space-y-2'}`}>
              <Input
                placeholder={compact ? "Escribe aquí..." : "Escribe tu pregunta aquí..."}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className={`border-au-lait focus:border-creme-brulee focus:ring-creme-brulee ${compact ? 'text-xs py-2' : 'text-sm py-4'}`}
                disabled={isStreaming}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || isStreaming}
                className={`w-full bg-creme-brulee text-white hover:bg-creme-brulee/90 shadow-md hover:shadow-lg transition-all ${compact ? 'py-2 text-xs' : 'py-4 text-sm'}`}
              >
                {isStreaming ? (
                  <span className="flex items-center gap-2 justify-center">
                    <div className={`border-2 border-white border-t-transparent rounded-full animate-spin ${compact ? 'w-3 h-3' : 'w-4 h-4'}`}></div>
                    {!compact && 'Enviando...'}
                  </span>
                ) : (
                  <>
                    <Send className={compact ? 'w-3 h-3 mr-1.5' : 'w-4 h-4 mr-2'} />
                    {compact ? 'Enviar' : 'Iniciar conversación'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

