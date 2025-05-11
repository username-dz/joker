// Using Vite's built-in environment variables system
const isProduction = import.meta.env.MODE === "production";

// Export the API URL and other configuration values
export const apiUrl =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/";
export const httpEndpoint =
  import.meta.env.VITE_HTTP_ENDPOINT || "http://localhost:8000";
export const frontEndpoint =
  import.meta.env.VITE_FRONTEND_ENDPOINT || "http://localhost:5173";
export const websocketEndpoint =
  import.meta.env.VITE_WEBSOCKET_ENDPOINT || "ws://localhost:8001";
export const isProductionMode = isProduction;

export default {
  apiUrl,
  httpEndpoint,
  frontEndpoint,
  websocketEndpoint,
  isProductionMode,
};
