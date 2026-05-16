import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function useCreateRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { propertyId: string, message?: string }) => {
      const response = await axiosInstance.post("/api/requests", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("¡Solicitud enviada exitosamente!");
      queryClient.invalidateQueries({ queryKey: ["tenant-requests"] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Error al enviar la solicitud";
      toast.error(message);
    }
  });
}
