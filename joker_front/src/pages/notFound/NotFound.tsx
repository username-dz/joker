import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
      <div
        className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src="/joker_logo.png"
            alt="Joker Logo"
            className="h-20 w-auto animate-pulse"
          />
        </div>

        {/* 404 Text with animation */}
        <div className="relative mb-4 text-center">
          <p className="text-9xl font-extrabold tracking-widest text-gray-300">
            404
          </p>
          <div className="absolute left-0 top-0 h-full w-full flex items-center justify-center">
            <p className="text-5xl font-bold tracking-wider text-primaryColor animate-bounce">
              Oops!
            </p>
          </div>
        </div>

        {/* Error message */}
        <div
          className={`mb-8 text-center transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <p className="mb-2 text-2xl font-semibold text-gray-700">
            Page Not Found
          </p>
          <p className="text-gray-500">
            We can't seem to find the page you're looking for.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            The page might have been removed, renamed, or doesn't exist.
          </p>
        </div>

        {/* Back to home button with hover effect */}
        <div
          className={`flex justify-center transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <Link
            to="/"
            className="group relative overflow-hidden rounded-full bg-primaryColor px-8 py-3 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <span className="relative z-10">Back to Homepage</span>
            <span className="absolute bottom-0 left-0 right-0 top-0 -z-0 h-full w-full translate-y-full bg-blue-700 transition-transform duration-300 ease-in-out group-hover:translate-y-0"></span>
          </Link>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-blue-100 opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
    </div>
  );
};

export default NotFound;
