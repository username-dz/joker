import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const success = await login(email, password);

      if (success) {
        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard/overview/");
        }, 1000);
      } else {
        setErrorMessage("Your account does not have administrator privileges.");
      }
    } catch (error: any) {
      setErrorMessage(
        error.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="bg-blue-600 p-6 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-20">
            <img
              src="/joker_logo.png"
              alt="Joker Logo"
              className="h-10 w-10 object-contain"
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold">Admin Login</h2>
          <p className="mt-1 text-blue-100">Sign in to access your dashboard</p>
        </div>

        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <p>{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <p>{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="mb-2 block font-medium text-gray-700"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="admin@joker.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  className="block font-medium text-gray-700"
                  htmlFor="password"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-center font-medium text-white transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="mr-2 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <FaSignInAlt className="mr-2" />
              )}
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
