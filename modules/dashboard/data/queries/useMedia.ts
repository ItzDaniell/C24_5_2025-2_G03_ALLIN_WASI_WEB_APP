import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type MediaFolder = {
  id: string;
  name: string;
  description?: string | null;
  path: string;
  owner_user_id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MediaFile = {
  id: string;
  filename: string;
  url: string;
  s3Key?: string;
  type: "image" | "video" | "tour360" | "avatar" | string;
  contentType?: string;
  property_id?: string | null;
  owner_user_id?: string;
  folder_id?: string | null;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

const fetchFolders = async (propertyId?: string): Promise<MediaFolder[]> => {
  const res = await axiosInstance.get(`/api/media/folders${propertyId ? `?propertyId=${propertyId}` : ""}`, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

const fetchMyFiles = async (options?: {
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<MediaFile[]> => {
  const params = new URLSearchParams();
  if (options?.type) params.append("type", options.type);
  if (options?.search) params.append("search", options.search);
  if (options?.limit) params.append("limit", String(options.limit));
  if (options?.offset) params.append("offset", String(options.offset));
  const queryString = params.toString();
  const res = await axiosInstance.get(`/api/media/my-files${queryString ? `?${queryString}` : ""}`, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

const fetchFilesByFolder = async (folderId: string): Promise<MediaFile[]> => {
  const res = await axiosInstance.get(`/api/media/folders/${folderId}/files`, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export function useMediaFolders(propertyId?: string) {
  return useQuery({
    queryKey: ["media", "folders", propertyId],
    queryFn: () => fetchFolders(propertyId),
    staleTime: 0, 
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });
}

export function useMyFiles(options?: {
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["media", "files", options],
    queryFn: () => fetchMyFiles(options),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });
}

export function useFilesByFolder(folderId: string | null) {
  return useQuery({
    queryKey: ["media", "files", "folder", folderId],
    queryFn: () => (folderId ? fetchFilesByFolder(folderId) : Promise.resolve([])),
    enabled: !!folderId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });
}
