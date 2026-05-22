import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface CreateReviewData {
  propertyId: string;
  rating: number;
  comment: string;
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const response = await axiosInstance.post("/api/reviews", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ["reviews-average", variables.propertyId] });
      toast.success("¡Reseña publicada con éxito!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Error al publicar la reseña";
      toast.error(message);
    },
  });
}
