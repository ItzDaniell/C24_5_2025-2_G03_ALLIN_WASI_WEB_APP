import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  authorId: string;
  author: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
  comments: Array<{
    id: string;
    content: string;
    postId: string;
    authorId: string;
    author: {
      id: string;
      fullName: string;
      profilePicture?: string;
    };
    createdAt: string;
  }>;
  reactions: Array<{
    id: string;
    type: string;
    userId: string;
    user: {
      id: string;
      fullName: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export function useCommunityPosts(category?: string) {
  return useQuery<CommunityPost[]>({
    queryKey: ["community-posts", category],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/community/posts", {
        params: category ? { category } : undefined,
      });
      return response.data;
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string; category: string; imageUrl?: string }) => {
      const response = await axiosInstance.post("/api/community/posts", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("¡Artículo publicado con éxito!");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Error al publicar el artículo";
      toast.error(msg);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await axiosInstance.delete(`/api/community/posts/${postId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Publicación eliminada correctamente.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar la publicación");
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { content: string; postId: string }) => {
      const response = await axiosInstance.post("/api/community/comments", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Comentario agregado.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al agregar comentario");
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await axiosInstance.delete(`/api/community/comments/${commentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Comentario eliminado.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar comentario");
    },
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { postId: string; type: string }) => {
      const response = await axiosInstance.post("/api/community/reactions", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al reaccionar");
    },
  });
}
