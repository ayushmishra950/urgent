import API from "./axios";
import { getAccessToken, setAccessToken } from "@/utils/tokenService";



// 🔐 Request Interceptor
API.interceptors.request.use((config) => {
  const token = getAccessToken();
  console.log(token)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔄 Response Interceptor (Auto Refresh)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await API.post("/api/auth/refreshtoken");
        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", res?.data?.accessToken)
        setAccessToken(newAccessToken);
           console.log(newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return API(originalRequest);

        

      } catch (err) {
       if (window.reactRouterNavigate) {
  window.reactRouterNavigate("/login");
} else {
  window.location.href = "/login";
}

      }
    }

    return Promise.reject(error);
  }
);

export default API;
