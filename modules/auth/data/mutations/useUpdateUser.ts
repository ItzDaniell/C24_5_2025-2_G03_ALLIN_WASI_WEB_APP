import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export interface UpdateUserPayload {
  fullName?: string;
  profilePicture?: string;
}

const updateUser = async (payload: UpdateUserPayload) => {
  const response = await axiosInstance.put(`/api/users/me`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export default function useUpdateUser() {
  return useMutation({
    mutationFn: (data: UpdateUserPayload) => updateUser(data),
    onSuccess: () => {
      toast.success("Perfil actualizado");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error?.response?.data?.message || "Error al actualizar el perfil";
      toast.error(message);
    },
  });
}


