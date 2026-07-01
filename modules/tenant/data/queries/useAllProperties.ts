import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export default function useAllProperties() {
  return useQuery({
    queryKey: ["all-properties"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/properties/search");
      return response.data;
    },
  });
}
