import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface PropertyStats {
  views: number;
  tours: number;
}

const fetchViews = async (propertyId: string, days = 30): Promise<number> => {
  const res = await axiosInstance.get(`/api/activities/property/${propertyId}/views?days=${days}`, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

const fetchTours = async (propertyId: string, days = 30): Promise<number> => {
  const res = await axiosInstance.get(`/api/activities/property/${propertyId}/tours?days=${days}`, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export default function usePropertyStats(propertyId?: string, days = 30) {
  const viewsQuery = useQuery({
    queryKey: ["property-views", propertyId, days],
    queryFn: () => fetchViews(propertyId!, days),
    enabled: !!propertyId,
    staleTime: 30_000,
  });
  const toursQuery = useQuery({
    queryKey: ["property-tours", propertyId, days],
    queryFn: () => fetchTours(propertyId!, days),
    enabled: !!propertyId,
    staleTime: 30_000,
  });
  return {
    views: viewsQuery.data ?? 0,
    tours: toursQuery.data ?? 0,
    isLoading: viewsQuery.isLoading || toursQuery.isLoading,
    error: viewsQuery.error || toursQuery.error,
  };
}
