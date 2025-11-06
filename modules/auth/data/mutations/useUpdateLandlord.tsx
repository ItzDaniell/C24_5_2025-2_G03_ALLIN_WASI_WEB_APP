import { useMutation } from "@tanstack/react-query";

import axiosInstance from "@/lib/axios";

interface UpdateProfilePayload {
  fullName?: string;
  profilePicture?: string;
  phone?: string;
}

const updateLandlord = async (_userId: string, payload: UpdateProfilePayload) => {
  const response = await axiosInstance.put(`/api/users/me`, payload);

  return response.data;
};

export default function useUpdateLandlord(userId: string) {
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateLandlord(userId, data),
  });
}

