import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Message } from "@/types/chatType";

const fetchMessages = async (conversationId: string, limit = 30, before?: string): Promise<Message[]> => {
  const params = new URLSearchParams();
  params.append("limit", String(limit));
  if (before) params.append("before", before);
  
  const res = await axiosInstance.get(`/api/chat/conversations/${conversationId}/messages?${params.toString()}`, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export default function useMessages(conversationId: string | null, limit = 30, before?: string) {
  return useQuery({
    queryKey: ["messages", conversationId, limit, before],
    queryFn: () => fetchMessages(conversationId!, limit, before),
    enabled: !!conversationId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });
}



