import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOST_URL,
  timeout: 10000,
  headers: {
    ContentType: "application/json",
  },
});

export default axiosInstance;
