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
  type: "image" | "video" | "tour360" | string;
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

const fetchMyFiles = async (propertyId?: string): Promise<MediaFile[]> => {
  const res = await axiosInstance.get(`/api/media/my-files${propertyId ? `?propertyId=${propertyId}` : ""}`, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export function useMediaFolders(propertyId?: string) {
  return useQuery({
    queryKey: ["media", "folders", propertyId],
    queryFn: () => fetchFolders(propertyId),
    staleTime: 30_000,
  });
}

export function useMyFiles(propertyId?: string) {
  return useQuery({
    queryKey: ["media", "files", propertyId],
    queryFn: () => fetchMyFiles(propertyId),
    staleTime: 30_000,
  });
}


