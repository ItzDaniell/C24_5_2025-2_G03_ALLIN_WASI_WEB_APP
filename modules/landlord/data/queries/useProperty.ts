import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type Property = any;

const fetchProperty = async (id: string): Promise<Property> => {
  const res = await axiosInstance.get(`/api/property/${id}`);
  return res.data;
};

export default function useProperty(id?: number | string) {
  const isValidId = !!id && id !== 'undefined' && id !== 'null' && String(id).trim() !== '';
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchProperty(String(id)),
    enabled: isValidId,
    staleTime: 60_000,
    retry: 1,
  });
}
