import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type Property = any; // TODO: replace with concrete type when available

const fetchMyProperties = async (): Promise<Property[]> => {
  const res = await axiosInstance.get("/api/property", { headers: { "Content-Type": "application/json" } });
  return res.data;
};

export default function useMyProperties(initialData?: Property[]) {
  return useQuery({
    queryKey: ["my-properties"],
    queryFn: fetchMyProperties,
    staleTime: 60_000,
    initialData,
  });
}
