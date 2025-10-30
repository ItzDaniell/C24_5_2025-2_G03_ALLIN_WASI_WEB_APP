import { useMutation } from "@tanstack/react-query";

import axiosInstance from "@/lib/axios";
import { UpdateLandlordData, UpdateUserData } from "@/types/userType";

interface UpdateLandlordPayload {
  userData: UpdateUserData;
  landlordData: UpdateLandlordData;
}

const updateLandlord = async (_userId: string, {userData, landlordData}: UpdateLandlordPayload) => {
  const response = await axiosInstance.put(`/api/users/me`, {
    user: userData,
    landlord: landlordData
  });

  return response.data;
};

export default function useUpdateLandlord(userId: string) {
  return useMutation({
    mutationFn: (data: UpdateLandlordPayload) => updateLandlord(userId, data),
  });
}

