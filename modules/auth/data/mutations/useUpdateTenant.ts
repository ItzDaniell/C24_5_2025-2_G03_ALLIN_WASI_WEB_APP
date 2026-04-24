import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface UpdateUserData {
  fullName?: string;
  profilePicture?: string;
}

interface UpdateTenantData {
  phone?: string;
  code?: string;
  career?: string;
  cicle?: string;
  monthly_budget?: number;
  origin_department?: string;
  studentIDCardUrl?: string;
}

interface UpdateProfilePayload {
  user?: UpdateUserData;
  tenant?: UpdateTenantData;
}

const updateTenant = async (payload: UpdateProfilePayload) => {
  const response = await axiosInstance.put(`/api/users/me/tenant-profile`, payload);
  return response.data;
};

export default function useUpdateTenant() {
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateTenant(data),
    onSuccess: () => {
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error?.response?.data?.message || "Error al completar el registro";
      toast.error(message);
    },
  });
}
