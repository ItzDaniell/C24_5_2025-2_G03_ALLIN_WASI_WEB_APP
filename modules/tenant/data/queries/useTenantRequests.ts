import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export default function useTenantRequests(status?: string) {
  return useQuery({
    queryKey: ["tenant-requests", status],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/requests/me", {
        params: { status }
      });
      return response.data;
    },
  });
}
