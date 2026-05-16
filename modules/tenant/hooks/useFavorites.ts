import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function useFavorites() {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<any[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/favorites");
      return res.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const res = await axiosInstance.post("/api/favorites", { propertyId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      // toast.success(data.isFavorite ? "Añadido a favoritos" : "Quitado de favoritos");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al actualizar favoritos");
    }
  });

  const toggleFavorite = (propertyId: string) => {
    toggleMutation.mutate(propertyId);
  };

  const isFavorite = (propertyId: string) => {
    return favorites.some((f: any) => f.id === propertyId);
  };

  return { favorites, toggleFavorite, isFavorite, isLoading };
}
