"use client";
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/ui/button";
import { AiChatArea } from "./AiChatArea";
import { useAiConversations } from "@/modules/landlord/data/queries/useAiChat";

interface AiChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiChatModal({ open, onOpenChange }: AiChatModalProps) {
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = React.useState<string | undefined>(undefined);
  const { refetch: refetchConversations } = useAiConversations();

  const handleConversationCreated = (newConversationId: string, title?: string) => {
    setConversationId(newConversationId);
    setConversationTitle(title);
    refetchConversations();
  };

  React.useEffect(() => {
    if (!open) {
      setConversationId(null);
      setConversationTitle(undefined);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-au-lait flex flex-col z-50 overflow-hidden">
      <div className="p-4 border-b border-au-lait flex items-center justify-between bg-gradient-to-r from-creme-brulee/5 to-transparent shrink-0">
        <h3 className="font-semibold text-inkwell text-base">Asistente Inteligente</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="h-6 w-6 p-0 hover:bg-au-lait rounded-full"
          aria-label="Cerrar chat"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <AiChatArea
          conversationId={conversationId}
          conversationTitle={conversationTitle}
          onConversationCreated={handleConversationCreated}
          showHeader={false}
          className="h-full border-0 shadow-none"
          compact={true}
        />
      </div>
    </div>
  );
}

