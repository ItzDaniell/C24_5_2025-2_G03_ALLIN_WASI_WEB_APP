import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { MediaFolder, MediaFile } from "../queries/useMedia";

// ===== FOLDERS =====

export interface CreateFolderPayload {
  name: string;
  path: string;
  propertyId?: string;
}

const createFolder = async (payload: CreateFolderPayload): Promise<MediaFolder> => {
  const res = await axiosInstance.post("/api/media/folders", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFolderPayload) => createFolder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media", "folders"] });
      toast.success("Carpeta creada exitosamente");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Error al crear la carpeta";
      toast.error(message);
    },
  });
}

const deleteFolder = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/media/folders/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
};

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFolder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media", "folders"] });
      qc.invalidateQueries({ queryKey: ["media", "files"] });
      toast.success("Carpeta eliminada");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Error al eliminar la carpeta";
      toast.error(message);
    },
  });
}

export interface CreateFilePayload {
  filename: string;
  url: string;
  s3Key: string;
  contentType: string;
  type: "image" | "video" | "avatar";
  propertyId?: string;
  folderId?: string;
}

const createFileRecord = async (payload: CreateFilePayload): Promise<MediaFile> => {
  const res = await axiosInstance.post("/api/media/files", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export function useCreateFileRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFilePayload) => createFileRecord(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["media", "files"] });
      qc.invalidateQueries({ queryKey: ["media", "folders"] });
      if (variables.folderId) {
        qc.invalidateQueries({ queryKey: ["media", "files", "folder", variables.folderId] });
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Error al registrar el archivo";
      toast.error(message);
    },
  });
}

const deleteFile = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/media/files/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
};

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFile(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media", "files"] });
      qc.invalidateQueries({ queryKey: ["media", "folders"] });
      qc.invalidateQueries({ queryKey: ["media", "files", "folder"] });
      toast.success("Archivo eliminado");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Error al eliminar el archivo";
      toast.error(message);
    },
  });
}

// ===== STORAGE (S3 Presign) =====

export interface PresignPayload {
  folder: string;
  contentType: string;
  filename?: string;
}

export interface PresignResponse {
  uploadUrl: string;
  resourceUrl: string;
  key: string;
  bucket: string;
  expiresIn: number;
}

const getPresignUrl = async (payload: PresignPayload): Promise<PresignResponse> => {
  const res = await axiosInstance.post("/api/storage/presign", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export function usePresignUrl() {
  return useMutation({
    mutationFn: (data: PresignPayload) => getPresignUrl(data),
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Error al generar URL de subida";
      toast.error(message);
    },
  });
}

