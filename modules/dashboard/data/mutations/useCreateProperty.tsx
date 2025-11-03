import { useMutation } from "@tanstack/react-query";
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
};

const createProperty = async (payload: CreatePropertyPayload) => {
  const res = await axiosInstance.post("/api/property", payload);
  return res.data;
};

export default function useCreateProperty() {
  return useMutation({
    mutationFn: (payload: CreatePropertyPayload) => createProperty(payload),
  });
}
