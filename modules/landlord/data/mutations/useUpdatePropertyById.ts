import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

type UpdateArgs = { id: string | number; payload: Record<string, any> };

const updatePropertyById = async ({ id, payload }: UpdateArgs) => {
  const res = await axiosInstance.patch(`/api/property/${id}`, payload);
  return res.data;
};

export default function useUpdatePropertyById() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: UpdateArgs) => updatePropertyById(args),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["my-properties"] });
      qc.invalidateQueries({ queryKey: ["property", String(variables.id)] });
    },
  });
}


