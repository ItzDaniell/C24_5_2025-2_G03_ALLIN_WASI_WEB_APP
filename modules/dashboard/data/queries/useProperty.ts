import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type Property = any;

const fetchProperty = async (id: string): Promise<Property> => {
  const res = await axiosInstance.get(`/api/property/${id}`);
  return res.data;
};

export default function useProperty(id?: number | string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchProperty(String(id)),
    enabled: !!id,
    staleTime: 60_000,
  });
}
