import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await axiosInstance.delete(`/api/requests/${requestId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-requests"] });
      toast.success("Solicitud cancelada correctamente");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al cancelar la solicitud");
    },
  });
}
