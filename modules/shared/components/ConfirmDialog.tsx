"use client";
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const isDestructive = variant === "destructive";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
        {/* Header con gradiente */}
        <div className={`px-6 pt-6 pb-4 ${
          isDestructive 
            ? "bg-red-50 border-b border-red-100" 
            : "bg-blue-50 border-b border-blue-100"
        }`}>
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full shrink-0 ${
                isDestructive 
                  ? "bg-red-500 shadow-lg shadow-red-500/20" 
                  : "bg-blue-500 shadow-lg shadow-blue-500/20"
              }`}>
                {isDestructive ? (
                  <AlertTriangle className="h-6 w-6 text-white" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <DialogTitle className={`text-xl font-semibold ${
                  isDestructive ? "text-red-900" : "text-gray-900"
                }`}>
                  {title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5">
          <DialogDescription className="text-base text-gray-600 leading-relaxed">
            {description}
          </DialogDescription>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="min-w-[100px] border-gray-300 hover:bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
            className={`min-w-[100px] ${
              isDestructive 
                ? "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

