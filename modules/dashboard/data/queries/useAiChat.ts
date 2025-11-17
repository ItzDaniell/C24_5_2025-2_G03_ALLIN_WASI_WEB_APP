import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type AiConversation = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type AiMessage = {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
};

const fetchConversations = async (): Promise<AiConversation[]> => {
  const res = await axiosInstance.get("/api/ai/conversations", {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

const fetchMessages = async (conversationId: string): Promise<{ conversation: AiConversation; messages: AiMessage[] }> => {
  const res = await axiosInstance.get(`/api/ai/conversations/${conversationId}/messages`, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export function useAiConversations() {
  return useQuery({
    queryKey: ["ai", "conversations"],
    queryFn: fetchConversations,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });
}

export function useAiMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["ai", "messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });
}

