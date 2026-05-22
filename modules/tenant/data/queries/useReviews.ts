import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  tenant: {
    userId: string;
    user: {
      fullName: string;
      profilePicture: string;
    };
  };
}

export function usePropertyReviews(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      const { data } = await axiosInstance.get(`/api/reviews/property/${propertyId}`);
      return data as Review[];
    },
    enabled: !!propertyId,
  });
}

export function usePropertyAverageRating(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["reviews-average", propertyId],
    queryFn: async () => {
      if (!propertyId) return 0;
      const { data } = await axiosInstance.get(`/api/reviews/property/${propertyId}/average`);
      return data.average as number;
    },
    enabled: !!propertyId,
  });
}

export function useLandlordAverageRating(landlordId: string | undefined) {
  return useQuery({
    queryKey: ["landlord-average", landlordId],
    queryFn: async () => {
      if (!landlordId) return 0;
      const { data } = await axiosInstance.get(`/api/reviews/landlord/${landlordId}/average`);
      return data.average as number;
    },
    enabled: !!landlordId,
  });
}
