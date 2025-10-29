export async function getUser(accessToken: string) {
  const response = await fetch(`${process.env.BACKEND_API_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error getting user profile");
  }

  return response;
}
