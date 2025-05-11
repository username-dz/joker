import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Use environment variables instead of environment files
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/";

// Create axios instance with default configuration
const instance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 seconds
  withCredentials: true, // Important for CSRF handling
  xsrfCookieName: "csrftoken", // Django's CSRF cookie name
  xsrfHeaderName: "X-CSRFToken", // Header Django looks for
});

// Request interceptor for handling auth tokens
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle errors (e.g., authentication errors)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

// Special pre-login function to ensure CSRF is set up
const preLogin = async () => {
  try {
    // Make a simple GET request to the API root to ensure the CSRF cookie is set
    await axios.get(API_URL, { withCredentials: true });
  } catch (error) {
    // Silent error
  }
};

// Helper function to determine if data contains File objects
const containsFileData = (data: any): boolean => {
  if (!data) return false;

  // Check each property in the data object
  for (const key in data) {
    if (data[key] instanceof File) {
      return true;
    }
  }

  return false;
};

// Helper to prepare FormData with proper file field names
const prepareFormData = (data: any): FormData => {
  const formData = new FormData();

  // Process all fields
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];

      if (value instanceof File) {
        // Debug file information
        console.log(
          `Adding file to FormData: ${key}, name: ${value.name}, size: ${value.size} bytes, type: ${value.type}`
        );

        // File objects need to match Django backend field names exactly
        formData.append(key, value, value.name);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
  }

  return formData;
};

// Type-safe request methods
const HttpClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.get(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    // Create a new config that won't modify the original
    const newConfig = { ...(config || {}) };

    // For requests with files, use FormData
    if (containsFileData(data)) {
      console.log("File data detected, converting to FormData");

      // Convert data to FormData
      const formData = prepareFormData(data);

      // Debug what's in the FormData
      console.log("FormData entries:");
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(
            `${pair[0]}: File object - ${(pair[1] as File).name}, size: ${(pair[1] as File).size} bytes`
          );
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // When sending files, we need to let the browser set the content type with boundary
      newConfig.headers = {
        ...newConfig.headers,
        "Content-Type": undefined, // Let axios set the content type to multipart/form-data with proper boundary
      };

      console.log("Sending POST request to:", url);
      return instance.post(url, formData, newConfig).catch((error) => {
        console.error("POST request failed:", error.message);
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
        }
        throw error;
      });
    }

    return instance.post(url, data, newConfig);
  },

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const newConfig = { ...(config || {}) };

    if (containsFileData(data)) {
      const formData = prepareFormData(data);
      newConfig.headers = {
        ...newConfig.headers,
        "Content-Type": undefined,
      };
      return instance.put(url, formData, newConfig);
    }

    return instance.put(url, data, newConfig);
  },

  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const newConfig = { ...(config || {}) };

    if (containsFileData(data)) {
      const formData = prepareFormData(data);
      newConfig.headers = {
        ...newConfig.headers,
        "Content-Type": undefined,
      };
      return instance.patch(url, formData, newConfig);
    }

    return instance.patch(url, data, newConfig);
  },

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.delete(url, config),

  // Special login handler that ensures CSRF is properly set up
  login: async <T = any>(email: string, password: string): Promise<T> => {
    // Ensure CSRF cookie is set before login attempt
    await preLogin();

    const response = await instance.post<T>("auth/login/", { email, password });

    // Save token if available
    if (response && typeof response === "object" && "key" in response) {
      localStorage.setItem("token", response.key as string);
    }

    return response as T;
  },
};

export default HttpClient;
