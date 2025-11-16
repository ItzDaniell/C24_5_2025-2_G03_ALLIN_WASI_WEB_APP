import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { CreateConversationDto, SendMessageDto } from "@/types/chatType";
import { toast } from "sonner";

const createConversation = async (dto: CreateConversationDto) => {
  const res = await axiosInstance.post("/api/chat/conversations", dto);
  return res.data;
};

const sendMessage = async (dto: SendMessageDto) => {
  const res = await axiosInstance.post("/api/chat/messages", dto);
  return res.data;
};

const markAsRead = async (conversationId: string) => {
  const res = await axiosInstance.post(`/api/chat/conversations/${conversationId}/read`);
  return res.data;
};

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error al crear conversación");
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error al enviar mensaje");
    },
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: (_, conversationId) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error al marcar como leído");
    },
  });
}



