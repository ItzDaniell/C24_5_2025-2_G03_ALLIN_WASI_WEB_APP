import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface CreateReportDto {
  reportedUserId: string;
  conversationId?: string;
  reason: string;
}

const createReport = async (dto: CreateReportDto) => {
  const res = await axiosInstance.post("/api/reports", dto);
  return res.data;
};

export function useCreateReport() {
  return useMutation({
    mutationFn: createReport,
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Error al enviar el reporte. Intenta de nuevo."
      );
    },
  });
}
