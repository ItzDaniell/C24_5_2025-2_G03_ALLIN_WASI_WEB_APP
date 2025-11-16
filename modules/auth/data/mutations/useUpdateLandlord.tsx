import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface UpdateUserData {
  fullName?: string;
  profilePicture?: string; // base64 (sin prefijo data:)
}

interface UpdateLandlordData {
  phone?: string;
  dni?: string;
  address?: string;
  propertiesCount?: string;
}

interface UpdateProfilePayload {
  user?: UpdateUserData;
  landlord?: UpdateLandlordData;
}

const updateLandlord = async (_userId: string, payload: UpdateProfilePayload) => {
  const response = await axiosInstance.put(`/api/users/me/profile`, payload);
  return response.data;
};

export default function useUpdateLandlord(userId: string) {
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateLandlord(userId, data),
    onSuccess: () => {
      toast.success("Registro completado exitosamente");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error?.response?.data?.message || "Error al completar el registro";
      toast.error(message);
    },
  });
}

