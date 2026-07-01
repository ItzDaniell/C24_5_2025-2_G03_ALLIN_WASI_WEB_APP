import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type CreatePropertyPayload = {
  title: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  monthlyPrice: number;
  currency: string;
  size: number;
  bathroomType: string;
  bedrooms: number;
  bathrooms: number;
  includedServices: string[];
  houseRules: string;
  status: string;
  tour360Url?: string;
  mediaFileIds?: string[];
};

const createProperty = async (payload: CreatePropertyPayload) => {
  const res = await axiosInstance.post("/api/property", payload);
  return res.data;
};

export default function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePropertyPayload) => createProperty(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["my-properties"] });
      if (data?.id) {
        qc.invalidateQueries({ queryKey: ["media", "files"] });
      }
    },
  });
}
