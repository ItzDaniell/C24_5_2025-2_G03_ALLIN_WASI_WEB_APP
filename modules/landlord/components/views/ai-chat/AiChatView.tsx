"use client";
import React from "react";
import { Button } from "@/ui/button";
import { useAiConversations, AiConversation } from "@/modules/landlord/data/queries/useAiChat";
import { useDeleteAiConversation } from "@/modules/landlord/data/mutations/useAiChat";
import { Trash2, Plus } from "lucide-react";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { AiChatArea } from "./AiChatArea";

interface AiChatViewProps {
  onViewChange: (view: string) => void;
}

export function AiChatView({ onViewChange }: AiChatViewProps) {
  const { data: conversations, isLoading: loadingConversations, refetch: refetchConversations } = useAiConversations();
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [conversationToDelete, setConversationToDelete] = React.useState<string | null>(null);
  const { mutate: deleteConversation, isPending: deleting } = useDeleteAiConversation();

  const selectedConversation = React.useMemo(() => {
    if (!selectedConversationId || !conversations) return null;
    return conversations.find((c) => c.id === selectedConversationId);
  }, [conversations, selectedConversationId]);

  const handleNewConversation = () => {
    setSelectedConversationId(null);
  };

  const handleConversationCreated = (newConversationId: string, title?: string) => {
    setSelectedConversationId(newConversationId);
    refetchConversations();
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!conversationToDelete) return;
    deleteConversation(conversationToDelete, {
      onSuccess: () => {
        if (selectedConversationId === conversationToDelete) {
          setSelectedConversationId(null);
        }
        setDeleteDialogOpen(false);
        setConversationToDelete(null);
      },
    });
  };


  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      <div className="w-80 shrink-0 flex flex-col border border-au-lait rounded-lg bg-white shadow-sm">
        <div className="p-4 border-b border-au-lait flex items-center justify-between bg-gradient-to-r from-creme-brulee/5 to-transparent">
          <h2 className="font-semibold text-inkwell text-lg">Conversaciones</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewConversation}
            className="gap-2 hover:bg-creme-brulee hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 text-sm text-lunar-eclipse">Cargando...</div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="p-4 text-sm text-lunar-eclipse text-center">
              No hay conversaciones. Inicia una nueva conversación.
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map((conv: AiConversation) => (
                <div
                  key={conv.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedConversationId === conv.id
                      ? "bg-creme-brulee text-white shadow-md"
                      : "hover:bg-au-lait text-inkwell hover:shadow-sm"
                  }`}
                  onClick={() => {
                    setSelectedConversationId(conv.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{conv.title}</p>
                      <p className={`text-xs mt-1.5 ${selectedConversationId === conv.id ? "text-white/80" : "text-lunar-eclipse"}`}>
                        {new Date(conv.updatedAt).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDeleteClick(conv.id, e)}
                      className={`h-6 w-6 p-0 ${selectedConversationId === conv.id ? "text-white hover:bg-white/20" : "text-lunar-eclipse hover:bg-au-lait"}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AiChatArea
        conversationId={selectedConversationId}
        conversationTitle={selectedConversation?.title}
        onConversationCreated={handleConversationCreated}
        showHeader={true}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar conversación?"
        description="Esta acción no se puede deshacer. Se eliminarán todos los mensajes de esta conversación."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={deleting}
      />
    </div>
  );
}

