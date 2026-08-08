import axios from 'axios';

const axiosClient = axios.create({ baseURL: '/api/v1' });

axiosClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, try one silent refresh before giving up and forcing sign-out.
let refreshPromise = null;

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }
      try {
        refreshPromise = refreshPromise || axios.post('/api/v1/auth/refresh', { refreshToken });
        const { data } = await refreshPromise;
        refreshPromise = null;
        const store = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
        store.setItem('accessToken', data.accessToken);
        store.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosClient(original);
      } catch (refreshErr) {
        refreshPromise = null;
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
