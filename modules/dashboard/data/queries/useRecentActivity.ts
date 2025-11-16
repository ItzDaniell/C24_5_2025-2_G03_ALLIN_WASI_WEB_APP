import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import type { ActivityLog } from "@/types/activityType";

const fetchRecentActivity = async (days: number = 7): Promise<ActivityLog[]> => {
  const res = await axiosInstance.get(`/api/activities/me?days=${days}`, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export default function useRecentActivity(days: number = 7) {
  return useQuery({
    queryKey: ["recent-activity", days],
    queryFn: () => fetchRecentActivity(days),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });
}


