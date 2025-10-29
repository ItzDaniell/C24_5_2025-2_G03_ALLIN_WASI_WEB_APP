import { API_BASE_URL } from "@/lib/constants";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed based on your backend response
}

export async function fetchUserProfile(accessToken: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Error fetching user profile");
    throw new Error(error);
  }

  return response.json();
}
