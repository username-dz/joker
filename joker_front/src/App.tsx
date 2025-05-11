import "./index.css";

import { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/header/Header";
import Loader from "./components/loaders/Loader";
import { ShopProvider } from "./contexts/ShopContext";
import { AuthProvider } from "./contexts/AuthContext";
import { MiniEditorProvider } from "./contexts/MiniEditorContext";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";

// Lazy load components for better performance
const NotFound = lazy(() => import("./pages/notFound/NotFound"));
const Admin = lazy(() => import("./pages/Admin/admin"));
const AdminMessages = lazy(() => import("./pages/Admin/AdminMessages"));
const Login = lazy(() => import("./pages/LoginAdmin/LoginAdmin"));
const Home = lazy(() => import("./pages/home/Home"));
const Shop = lazy(() => import("./pages/Shop/Shop"));
const Dashboard = lazy(() => import("./pages/Dashboard/dashboard"));
const Articles = lazy(() => import("./pages/Articles/Articles"));
const ContactForm = lazy(() => import("./pages/contact/Contact"));
const AboutUs = lazy(() => import("./components/about/AboutUs"));
const MyOrders = lazy(() => import("./pages/myOrders/MyOrders"));

// Page transition variants
const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
};

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Check if document is already loaded
    if (document.readyState === "complete") {
      setIsLoaded(true);

      // Add a slight delay before removing first load state for smooth transition
      const timer = setTimeout(() => {
        setIsFirstLoad(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      const handleLoad = () => {
        setIsLoaded(true);

        // Add a slight delay before removing first load state for smooth transition
        setTimeout(() => {
          setIsFirstLoad(false);
        }, 300);
      };

      window.addEventListener("load", handleLoad);

      // Fallback timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setIsLoaded(true);
        setTimeout(() => {
          setIsFirstLoad(false);
        }, 300);
      }, 2000);

      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  // Custom loader component with animated entrance and exit
  const PageLoader = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="flex flex-col items-center">
        <Loader
          backgroundColor="transparent"
          color="#DB3F40"
          className="h-16 w-16"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="mt-4 text-lg font-medium text-gray-600"
        >
          Chargement...
        </motion.p>
      </div>
    </motion.div>
  );

  return (
    <ShopProvider>
      <BrowserRouter>
        <AuthProvider>
          <MiniEditorProvider>
            <AnimatePresence mode="wait">
              {isFirstLoad && <PageLoader key="loader" />}
            </AnimatePresence>

            <div
              className={`relative min-h-screen ${isFirstLoad ? "overflow-hidden" : ""}`}
            >
              <Header />

              <main>
                <AnimatePresence mode="wait">
                  {!isLoaded ? (
                    <motion.div
                      key="content-loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-12 flex h-full w-full items-center justify-center"
                    >
                      <Loader
                        backgroundColor="transparent"
                        color="#DB3F40"
                        className="h-12 w-12"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      <Suspense
                        fallback={
                          <div className="flex h-[80vh] items-center justify-center">
                            <Loader
                              backgroundColor="transparent"
                              color="#DB3F40"
                              className="h-12 w-12"
                            />
                          </div>
                        }
                      >
                        <Routes>
                          <Route
                            path="/"
                            element={
                              <motion.div {...pageTransition}>
                                <Home />
                              </motion.div>
                            }
                          />
                          <Route
                            path="/design/"
                            element={
                              <motion.div {...pageTransition}>
                                <Articles />
                              </motion.div>
                            }
                          />
                          <Route
                            path="/kedache/"
                            element={
                              <motion.div {...pageTransition}>
                                <Login />
                              </motion.div>
                            }
                          />
                          <Route
                            path="/dashboard/overview/"
                            element={
                              <ProtectedRoute requireAdmin={true}>
                                <motion.div {...pageTransition}>
                                  <Dashboard />
                                </motion.div>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dashboard/requests/"
                            element={
                              <ProtectedRoute requireAdmin={true}>
                                <motion.div {...pageTransition}>
                                  <Admin />
                                </motion.div>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dashboard/messages/"
                            element={
                              <ProtectedRoute requireAdmin={true}>
                                <motion.div {...pageTransition}>
                                  <AdminMessages />
                                </motion.div>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/contact/"
                            element={
                              <motion.div {...pageTransition}>
                                <ContactForm />
                              </motion.div>
                            }
                          />
                          <Route
                            path="/about/"
                            element={
                              <motion.div {...pageTransition}>
                                <AboutUs />
                              </motion.div>
                            }
                          />
                          <Route
                            path="/my-orders/"
                            element={
                              <motion.div {...pageTransition}>
                                <MyOrders />
                              </motion.div>
                            }
                          />
                          <Route
                            path="/shop/:item"
                            element={
                              <motion.div {...pageTransition}>
                                <Shop />
                              </motion.div>
                            }
                          />
                          <Route
                            path="*"
                            element={
                              <motion.div {...pageTransition}>
                                <NotFound />
                              </motion.div>
                            }
                          />
                        </Routes>
                      </Suspense>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </div>
          </MiniEditorProvider>
        </AuthProvider>
      </BrowserRouter>
    </ShopProvider>
  );
}

export default App;
