import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Conversation } from "@/types/chatType";

const fetchConversations = async (): Promise<Conversation[]> => {
  const res = await axiosInstance.get("/api/chat/conversations", {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export default function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}



