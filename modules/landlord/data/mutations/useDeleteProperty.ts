import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const deleteProperty = async (id: string) => {
  const res = await axiosInstance.delete(`/api/property/${id}`);
  return res.data;
};

export default function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-properties"] });
    },
  });
}
