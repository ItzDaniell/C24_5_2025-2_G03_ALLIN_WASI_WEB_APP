import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string | null;
}

async function fetchUserById(userId: string): Promise<UserProfile> {
  try {
    const res = await axiosInstance.get(`/api/users/me/profile`, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data?.user;
  } catch (error) {
    // Si falla, retornar un usuario vacío
    return {
      id: userId,
      fullName: "",
      email: "",
      profilePicture: null,
    };
  }
}

export default function useUserById(userId?: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId || ""),
    enabled: !!userId,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}
