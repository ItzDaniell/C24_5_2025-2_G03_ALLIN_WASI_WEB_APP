import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface MeResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    profilePicture?: string | null;
    role?: string | { id: string; name: string; description?: string };
  };
  landlord?: {
    phone?: string;
    dni?: string;
    address?: string;
    propertyCount?: string;
    dniFrontUrl?: string | null;
    dniBackUrl?: string | null;
    utilityBillUrl?: string | null;
    verificationStatus?: 'pending' | 'verified' | 'rejected' | string;
    verificationMessage?: string | null;
  };
  tenant?: {
    id?: string;
    phone?: string;
    code?: string;
    career?: string;
    cicle?: string;
    bio?: string;
    monthly_budget?: number;
    origin_department?: string;
    studentIDCardUrl?: string | null;
    verificationStatus?: string;
  };
}

async function fetchMe(): Promise<MeResponse> {
  const res = await axiosInstance.get("/api/users/me/profile", { headers: { "Content-Type": "application/json" } });
  return res.data;
}

export default function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: "always",
  });
}
