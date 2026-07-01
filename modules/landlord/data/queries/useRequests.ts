import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Request, RequestStatus } from "@/types/requestType";

const fetchRequests = async (type: "landlord" | "me" = "landlord", status?: RequestStatus): Promise<Request[]> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  params.append("type", type);
  
  const res = await axiosInstance.get(`/api/requests?${params.toString()}`, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export default function useRequests(type: "landlord" | "me" = "landlord", status?: RequestStatus) {
  return useQuery({
    queryKey: ["requests", type, status],
    queryFn: () => fetchRequests(type, status),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });
}



