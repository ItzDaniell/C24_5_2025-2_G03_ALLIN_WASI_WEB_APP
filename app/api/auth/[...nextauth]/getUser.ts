export async function getUser(accessToken: string) {
  const BASE_URL = process.env.BACKEND_API_URL || process.env.API_BASE_URL;
  
  if (!BASE_URL) {
    throw new Error("API base URL is not configured. Set BACKEND_API_URL or API_BASE_URL in your environment.");
  }

  const response = await fetch(`${BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response;
}
