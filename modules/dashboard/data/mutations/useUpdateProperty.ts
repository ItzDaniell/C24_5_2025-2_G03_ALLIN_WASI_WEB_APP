import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type UpdatePropertyPayload = Record<string, any>;

const updateProperty = async (id: string, payload: UpdatePropertyPayload) => {
  const res = await axiosInstance.patch(`/api/property/${id}`, payload);
  return res.data;
};

export default function useUpdateProperty(id: string | number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePropertyPayload) => updateProperty(String(id), payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-properties"] });
      qc.invalidateQueries({ queryKey: ["property", String(id)] });
    },
  });
}
