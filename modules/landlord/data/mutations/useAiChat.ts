import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export type ChatRequest = {
  conversationId?: string;
  title?: string;
  messages: ChatMessage[];
};

export type ChatResponse = {
  answer: string;
  conversationId: string;
  model: string;
  userId: string;
};

const sendChatMessage = async (
  payload: ChatRequest,
  onChunk?: (chunk: string, metadata?: any) => void
): Promise<ChatResponse> => {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || "Error al enviar mensaje");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let conversationId = "";
  let title = "";
  if (!reader) {
    throw new Error("No se pudo obtener el stream");
  }
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;  
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));          
          if (data.type === "chunk") {
            const chunkContent = data.content || "";
            if (chunkContent) {
              fullText += chunkContent;
              conversationId = data.conversationId || conversationId;
              onChunk?.(chunkContent, { conversationId, title });
            }
          } else if (data.type === "conversation_created") {
            conversationId = data.conversationId || conversationId;
            title = data.title || title;
            onChunk?.("", { conversationId, title, type: "conversation_created" });
          } else if (data.type === "done") {
            return {
              answer: data.answer || fullText,
              conversationId: data.conversationId || conversationId,
              model: data.model || "gemini-2.5-flash",
              userId: data.userId || "",
            };
          } else if (data.type === "error") {
            throw new Error(data.message || "Error en el stream");
          }
        } catch (e) {
        }
      }
    }
  }

  return {
    answer: fullText,
    conversationId,
    model: "gemini-2.5-flash",
    userId: "",
  };
};

const deleteConversation = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/ai/conversations/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
};

export function useSendAiMessage() {
  const qc = useQueryClient();
  return {
    mutate: (
      payload: ChatRequest,
      options?: {
        onChunk?: (chunk: string, metadata?: any) => void;
        onSuccess?: (data: ChatResponse) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      sendChatMessage(payload, options?.onChunk)
        .then((data) => {
          qc.invalidateQueries({ queryKey: ["ai", "conversations"] });
          if (data.conversationId) {
            qc.invalidateQueries({ queryKey: ["ai", "messages", data.conversationId] });
            qc.refetchQueries({ queryKey: ["ai", "messages", data.conversationId] });
          }
          qc.refetchQueries({ queryKey: ["ai", "conversations"] });
          options?.onSuccess?.(data);
        })
        .catch((err) => {
          const message = err?.message || "Error al enviar mensaje";
          toast.error(message);
          options?.onError?.(err);
        });
    },
    isPending: false,
  };
}

export function useDeleteAiConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai", "conversations"] });
      toast.success("Conversación eliminada");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Error al eliminar conversación";
      toast.error(message);
    },
  });
}

