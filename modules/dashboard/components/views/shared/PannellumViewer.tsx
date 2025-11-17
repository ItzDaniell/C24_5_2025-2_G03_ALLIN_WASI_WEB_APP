"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { X } from "lucide-react";
import "pannellum/build/pannellum.css";

interface PannellumViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
}

export function PannellumViewer({ open, onOpenChange, imageUrl, title = "Tour 360°" }: PannellumViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImageAsDataUrl = async (url: string): Promise<string> => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const isS3Url = url.includes('s3.amazonaws.com') || url.includes('.s3.');
      const proxyUrl = isS3Url 
        ? `${API_BASE_URL}/storage/proxy?url=${encodeURIComponent(url)}`
        : url;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 60000);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No se pudo leer el error');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const blob = await response.blob();
      
      if (!blob || blob.size === 0) {
        throw new Error('La imagen está vacía');
      }
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Error al convertir imagen a data URL'));
          }
        };
        reader.onerror = () => {
          reject(new Error('Error al leer la imagen'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error: any) {
      throw new Error(`Error al cargar la imagen: ${error?.message || 'Error desconocido'}`);
    }
  };

  useEffect(() => {
    if (!open || !imageUrl) {
      return;
    }

    const loadPannellum = async () => {
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.destroy();
        } catch (e) {
        }
        viewerInstanceRef.current = null;
      }

      setIsLoading(true);
      setError(null);

      await new Promise(resolve => setTimeout(resolve, 100));

      if (!viewerRef.current) {
        setIsLoading(false);
        return;
      }

      try {
        await import("pannellum/build/pannellum.js");
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const pannellum = (window as any).pannellum;
        
        if (!pannellum || typeof pannellum.viewer !== 'function') {
          setError('Pannellum no está disponible');
          setIsLoading(false);
          return;
        }
        
        const dataUrl = await loadImageAsDataUrl(imageUrl);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (!viewerRef.current) {
          setIsLoading(false);
          return;
        }
        
        viewerInstanceRef.current = pannellum.viewer(viewerRef.current, {
          type: "equirectangular",
          panorama: dataUrl,
          autoLoad: true,
          autoRotate: -2,
          showControls: true,
          compass: true,
          keyboardZoom: true,
          mouseZoom: true,
          hfov: 100,
          minHfov: 50,
          maxHfov: 120,
        });
        
        setIsLoading(false);
      } catch (error: any) {
        setError(error.message || 'Error al cargar el tour 360°');
        setIsLoading(false);
      }
    };

    loadPannellum();

    return () => {
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.destroy();
        } catch (e) {
        }
        viewerInstanceRef.current = null;
      }
    };
  }, [open, imageUrl]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="absolute top-4 left-4 z-50 bg-black/50 text-white px-4 py-2 rounded-lg">
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription className="text-white/80 text-xs">
            Visualización de imagen panorámica 360°
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="ghost"
          size="lg"
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 p-0"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </Button>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-creme-brulee mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando imagen 360°...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center p-6">
              <p className="text-red-600 font-medium mb-2">Error al cargar la imagen</p>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          </div>
        )}
        <div 
          ref={viewerRef} 
          className="w-full h-full min-h-[500px] relative"
        />
      </DialogContent>
    </Dialog>
  );
}

