import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingBag,
  FaArrowLeft,
  FaTruck,
  FaBox,
  FaCheckCircle,
  FaSpinner,
  FaCalendarAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
  id: number | string;
  date: string;
  name: string;
  articleType: string;
  color: string;
  size: string;
  price: number;
  quantity?: number;
  status: string;
  frontImage: string | null;
  backImage: string | null;
}

const MyOrders = () => {
  const validateImageUrl = (url: string | null): boolean => {
    if (!url) return false;

    if (url.startsWith("data:image/") || url.startsWith("data:application/")) {
      return true; // Accept all data URLs
    }

    if (url.startsWith("http")) {
      return true;
    }

    return false;
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");

      const validOrders = savedOrders.filter((order: any) => {
        return order.id && order.date && order.name && order.price;
      });

      const sortedOrders = validOrders.sort(
        (a: Order, b: Order) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTimeout(() => {
        setOrders(sortedOrders);
        setIsLoading(false);
      }, 600);
    } catch (error) {
      setOrders([]);
      setIsLoading(false);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <FaCheckCircle className="text-green-500" />;
      case "processing":
        return <FaSpinner className="animate-spin text-blue-500" />;
      case "shipped":
        return <FaTruck className="text-purple-500" />;
      case "cancelled":
        return <FaBox className="text-red-500" />;
      default:
        return <FaCalendarAlt className="text-gray-500" />;
    }
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case "t_shirt":
        return "T-Shirt";
      case "sweet_shirt":
        return "Sweatshirt";
      case "mug":
        return "Mug";
      case "key_ring":
        return "Porte-clés";
      default:
        return type.replace("_", " ");
    }
  };

  const getStepStatus = (orderStatus: string, stepName: string) => {
    const statusOrder = ["processing", "shipped", "delivered", "completed"];
    const orderIndex = statusOrder.indexOf(orderStatus.toLowerCase());
    const stepIndex = statusOrder.indexOf(stepName.toLowerCase());

    if (orderIndex >= stepIndex) {
      return "bg-green-500";
    }
    return "bg-gray-300";
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-16 pb-24 md:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            to="/"
            className="group flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2 text-blue-600 shadow-md transition-all hover:bg-blue-600 hover:text-white hover:shadow-lg"
          >
            <FaArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Retour à l'accueil</span>
          </Link>
          <div className="mt-8 flex items-center justify-between">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              <span className="relative">
                Mes Commandes
                <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-[#DB3F40]"></span>
              </span>
            </h1>
          </div>
          <p className="mt-3 text-lg text-gray-600">
            Consultez et suivez toutes vos commandes
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-[#DB3F40]"></div>
              <p className="mt-4 text-lg text-gray-600">
                Chargement de vos commandes...
              </p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-xl"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <FaShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-800">
              Aucune commande
            </h2>
            <p className="mb-8 text-lg text-gray-600">
              Vous n'avez pas encore passé de commande.
            </p>
            <Link
              to="/design/"
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-[#DB3F40] to-purple-600 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                Commencer vos achats
                <svg
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
              <span className="absolute bottom-0 left-0 h-full w-0 bg-black bg-opacity-20 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <AnimatePresence>
              {!selectedOrder &&
                currentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="relative p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {order.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            <FaCalendarAlt className="text-[#DB3F40]" />
                            {formatDate(order.date)}
                          </div>
                        </div>
                        <span
                          className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-6 flex items-center gap-4">
                        {order.frontImage &&
                        validateImageUrl(order.frontImage) ? (
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-1 shadow-inner">
                            <img
                              src={order.frontImage}
                              alt="Design avant"
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-image.png";
                                e.currentTarget.onerror = null;
                              }}
                            />
                          </div>
                        ) : null}
                        <div className="flex-1">
                          <p className="text-md font-medium text-gray-900">
                            {getProductTypeLabel(order.articleType)} •
                            <span
                              className="ml-1 inline-block h-3 w-3 rounded-full"
                              style={{ backgroundColor: order.color }}
                            ></span>
                            <span className="ml-1">{order.color}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Taille :{" "}
                            <span className="font-medium">{order.size}</span>
                            {order.quantity && order.quantity > 1 && (
                              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                                x{order.quantity}
                              </span>
                            )}
                          </p>
                          <p className="mt-2 text-lg font-bold text-[#DB3F40]">
                            {order.price} DA
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex w-3/4 items-center space-x-2">
                          <div
                            className={`h-2 w-2 rounded-full ${getStepStatus(order.status, "processing")}`}
                          ></div>
                          <div
                            className={`h-[2px] flex-grow ${getStepStatus(order.status, "shipped")}`}
                          ></div>
                          <div
                            className={`h-2 w-2 rounded-full ${getStepStatus(order.status, "shipped")}`}
                          ></div>
                          <div
                            className={`h-[2px] flex-grow ${getStepStatus(order.status, "delivered")}`}
                          ></div>
                          <div
                            className={`h-2 w-2 rounded-full ${getStepStatus(order.status, "delivered")}`}
                          ></div>
                          <div
                            className={`h-[2px] flex-grow ${getStepStatus(order.status, "completed")}`}
                          ></div>
                          <div
                            className={`h-2 w-2 rounded-full ${getStepStatus(order.status, "completed")}`}
                          ></div>
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 group-hover:bg-[#DB3F40] group-hover:text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            {!selectedOrder && orders.length > ordersPerPage && (
              <div className="col-span-full mt-8 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 rounded-lg border px-4 py-2 ${
                      currentPage === 1
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Précédent
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-lg px-4 py-2 ${
                          currentPage === page
                            ? "bg-[#DB3F40] text-white shadow-md"
                            : "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 rounded-lg border px-4 py-2 ${
                      currentPage === totalPages
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
                    }`}
                  >
                    Suivant
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            )}

            {selectedOrder && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full overflow-hidden rounded-xl bg-white shadow-xl"
              >
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="group flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-blue-600 shadow-sm transition-all hover:bg-blue-600 hover:text-white"
                    >
                      <FaArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
                      Retour aux commandes
                    </button>
                    <span
                      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${getStatusColor(selectedOrder.status)}`}
                    >
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Commande #{selectedOrder.id}
                      </h2>
                      <p className="mt-1 flex items-center gap-2 text-lg text-gray-600">
                        <FaCalendarAlt className="text-[#DB3F40]" />
                        {formatDate(selectedOrder.date)}
                      </p>
                    </div>

                    <div className="hidden items-center space-x-2 rounded-lg bg-gray-50 px-6 py-3 shadow-inner sm:flex">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            getStepStatus(
                              selectedOrder.status,
                              "processing"
                            ) === "bg-green-500"
                              ? "bg-green-500 text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          <FaSpinner
                            className={`${
                              selectedOrder.status.toLowerCase() ===
                              "processing"
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                        </div>
                        <span className="mt-1 text-xs font-medium">
                          Traitement
                        </span>
                      </div>

                      <div
                        className={`h-0.5 w-12 ${getStepStatus(selectedOrder.status, "shipped")}`}
                      ></div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            getStepStatus(selectedOrder.status, "shipped") ===
                            "bg-green-500"
                              ? "bg-green-500 text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          <FaTruck />
                        </div>
                        <span className="mt-1 text-xs font-medium">
                          Expédié
                        </span>
                      </div>

                      <div
                        className={`h-0.5 w-12 ${getStepStatus(selectedOrder.status, "completed")}`}
                      ></div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            getStepStatus(selectedOrder.status, "completed") ===
                            "bg-green-500"
                              ? "bg-green-500 text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          <FaCheckCircle />
                        </div>
                        <span className="mt-1 text-xs font-medium">Livré</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-6 shadow-inner">
                      <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-900">
                        <svg
                          className="h-5 w-5 text-[#DB3F40]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Détails du produit
                      </h3>

                      <div className="space-y-4 text-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Produit :</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Type :</span>
                          <span className="font-medium text-gray-900">
                            {getProductTypeLabel(selectedOrder.articleType)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Taille :</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.size}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Couleur :</span>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-5 w-5 rounded-full border border-gray-300"
                              style={{ backgroundColor: selectedOrder.color }}
                            ></div>
                            <span className="font-medium text-gray-900">
                              {selectedOrder.color}
                            </span>
                          </div>
                        </div>
                        {selectedOrder.quantity &&
                          selectedOrder.quantity > 1 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Quantité :</span>
                              <span className="font-medium text-gray-900">
                                {selectedOrder.quantity}
                              </span>
                            </div>
                          )}
                        <div className="flex items-center justify-between border-t border-dashed border-gray-300 pt-4">
                          <span className="text-gray-800">Total :</span>
                          <span className="text-xl font-bold text-[#DB3F40]">
                            {selectedOrder.price} DA
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-6 shadow-inner">
                      <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-900">
                        <svg
                          className="h-5 w-5 text-[#DB3F40]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Votre Design
                      </h3>
                      <div className="flex flex-wrap justify-center gap-6">
                        {selectedOrder.frontImage &&
                        validateImageUrl(selectedOrder.frontImage) ? (
                          <div className="w-full max-w-[220px]">
                            <p className="mb-2 text-center font-medium text-gray-900">
                              Avant
                            </p>
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md">
                              <img
                                src={selectedOrder.frontImage}
                                alt="Design avant"
                                className="mx-auto h-auto max-h-56 w-auto object-contain transition-transform hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder-image.png";
                                  e.currentTarget.onerror = null;
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full max-w-[220px]">
                            <p className="mb-2 text-center font-medium text-gray-900">
                              Avant
                            </p>
                            <div className="flex h-56 items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-md">
                              <p className="text-gray-400">
                                Aucun design sauvegardé
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedOrder.backImage ? (
                          <div className="w-full max-w-[220px]">
                            <p className="mb-2 text-center font-medium text-gray-900">
                              Arrière
                            </p>
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md">
                              <img
                                src={selectedOrder.backImage}
                                alt="Design arrière"
                                className="mx-auto h-auto max-h-56 w-auto object-contain transition-transform hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder-image.png";
                                  e.currentTarget.onerror = null;
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full max-w-[220px]">
                            <p className="mb-2 text-center font-medium text-gray-900">
                              Arrière
                            </p>
                            <div className="flex h-56 items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-md">
                              <p className="text-gray-400">
                                Pas de design arrière
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-center">
                    <Link
                      to={`/shop/${selectedOrder.name}`}
                      className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-[#DB3F40] to-purple-600 px-8 py-4 text-white shadow-lg transition-all hover:shadow-xl"
                    >
                      <span className="relative z-10 flex items-center gap-2 font-medium">
                        Commander à nouveau
                        <svg
                          className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </span>
                      <span className="absolute bottom-0 left-0 h-full w-0 bg-black bg-opacity-20 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
