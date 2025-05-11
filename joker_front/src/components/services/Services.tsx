import React, { useState, useEffect, useRef } from "react";
import { servicesData, ServiceItem } from "./products";
import { categories, Category } from "./categories";
import { FaCircleChevronRight, FaCircleChevronLeft } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Services: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1); // Start with "Tous"
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isStartOfScroll, setIsStartOfScroll] = useState(true);
  const [isEndOfScroll, setIsEndOfScroll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Add a key to force remounting of grid when page changes
  const [gridKey, setGridKey] = useState(0);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 6;

  // Improved filtering logic
  const filteredServices = servicesData.filter((service: ServiceItem) => {
    if (selectedCategoryId === 1) return true; // "Tous" category shows everything

    const categoryName = categories.find(
      (cat) => cat.id === selectedCategoryId,
    )?.name;
    return service.category === categoryName;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / itemsPerPage),
  );
  const displayedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Add loading state when changing categories
  const handleCategoryChange = (categoryId: number) => {
    setIsLoading(true);
    setSelectedCategoryId(categoryId);
    setCurrentPage(1); // Reset to first page when changing category
    setGridKey((prevKey) => prevKey + 1); // Force grid remount

    // Simulate loading for better UX (prevents flash of empty content)
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // Improved page change handler with grid remount
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    // Set loading to true briefly to show transition
    setIsLoading(true);

    // Update current page
    setCurrentPage(page);

    // Force grid remount to prevent animation issues
    setGridKey((prevKey) => prevKey + 1);

    // Smooth scroll to services section
    document
      .getElementById("services")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Small delay to show loading indicator
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  const scrollCategories = (direction: "left" | "right") => {
    const element = categoriesRef.current;
    if (!element) return;

    const scrollAmount = 200;
    const targetScroll =
      direction === "left"
        ? element.scrollLeft - scrollAmount
        : element.scrollLeft + scrollAmount;

    element.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const element = categoriesRef.current;
    if (element) {
      setIsStartOfScroll(element.scrollLeft <= 10);
      setIsEndOfScroll(
        element.scrollWidth - element.scrollLeft - element.clientWidth <= 10,
      );
    }
  };

  useEffect(() => {
    const element = categoriesRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => {
        element.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Faster staggering
        duration: 0.2, // Faster overall animation
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.1 },
    },
  };

  return (
    <section
      id="services"
      className="relative bg-gradient-to-b from-gray-50 to-white py-16"
    >
      {/* Decorative elements with pointer-events-none */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-50 opacity-60"></div>
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-red-50 opacity-60"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header - More compact */}
        <div className="mb-8 text-center">
          <span className="mb-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#DB3F40]">
            Nos Collections
          </span>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Découvrez Nos Services
          </h2>
          <div className="mx-auto mb-4 h-1 w-24 bg-[#DB3F40]"></div>
          <p className="mx-auto max-w-2xl text-gray-600">
            Nous offrons des services d'impression de haute qualité sur une
            large gamme de vêtements et d'accessoires.
          </p>
        </div>

        {/* Categories Navigation */}
        <div className="relative mb-8">
          {!isStartOfScroll && (
            <button
              onClick={() => scrollCategories("left")}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-red-50 md:left-2"
              aria-label="Scroll categories left"
            >
              <FaCircleChevronLeft className="h-5 w-5 text-[#DB3F40]" />
            </button>
          )}

          <div
            ref={categoriesRef}
            className="scrollbar-hide flex justify-center space-x-3 overflow-x-auto rounded-xl bg-white px-8 py-3 shadow-sm"
          >
            {categories.map((category: Category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`group flex min-w-max flex-col items-center space-y-1 rounded-lg px-4 py-2 transition-all duration-300 hover:bg-red-50 ${
                  selectedCategoryId === category.id
                    ? "bg-red-50 text-[#DB3F40]"
                    : "text-gray-600"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    selectedCategoryId === category.id
                      ? "bg-[#DB3F40] text-white"
                      : "bg-gray-100 text-gray-500 group-hover:bg-red-100"
                  } transition-colors duration-300`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-6 w-6 rounded-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/fallback-icon.png"; // Fallback
                    }}
                  />
                </div>
                <span className="whitespace-nowrap text-sm font-medium">
                  {category.name}
                </span>
              </button>
            ))}
          </div>

          {!isEndOfScroll && (
            <button
              onClick={() => scrollCategories("right")}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-red-50 md:right-2"
              aria-label="Scroll categories right"
            >
              <FaCircleChevronRight className="h-5 w-5 text-[#DB3F40]" />
            </button>
          )}
        </div>

        {/* Products Grid - Fixed height container to prevent layout shift */}
        <div className="min-h-[500px]">
          {isLoading ? (
            <div className="flex h-64 w-full items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#DB3F40] border-t-transparent"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={gridKey} // Force remount when page changes
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {!filteredServices.length ? (
                  <div className="col-span-full flex h-64 w-full items-center justify-center rounded-lg bg-white p-6 text-center shadow">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                        <FaSearch className="h-8 w-8 text-[#DB3F40] opacity-60" />
                      </div>
                      <p className="text-lg font-medium text-gray-500">
                        Aucun service trouvé dans cette catégorie
                      </p>
                      <p className="mt-2 text-sm text-gray-400">
                        Essayez de sélectionner une autre catégorie
                      </p>
                      <button
                        onClick={() => handleCategoryChange(1)}
                        className="mt-4 rounded-full bg-[#DB3F40] px-6 py-2 text-white transition-all duration-300 hover:bg-[#c02c2d]"
                      >
                        Voir Tous Les Services
                      </button>
                    </div>
                  </div>
                ) : (
                  displayedServices.map((service: ServiceItem) => (
                    <motion.div
                      key={service.id}
                      variants={itemVariants}
                      className="group overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* More compact card with smaller image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                        {/* Adding onLoad handler to ensure images are fully loaded */}
                        <img
                          src={service.image}
                          alt={service.name}
                          className="h-full w-full object-contain object-center p-4 transition-transform duration-500 group-hover:scale-105"
                          loading="eager" // Force eager loading
                          onError={(e) => {
                            e.currentTarget.src = "/fallback-product.png"; // Fallback
                          }}
                        />
                        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <Link
                            to={`/shop/${service.linkPath || "tshirt"}`}
                            className="mb-3 inline-flex items-center gap-1 rounded-full bg-[#DB3F40] px-4 py-2 text-sm font-medium text-white shadow-lg transition-transform duration-300 hover:scale-105"
                          >
                            <FaShoppingCart className="h-3 w-3" /> Personnaliser
                          </Link>
                        </div>
                      </div>

                      {/* More compact content area */}
                      <div className="p-4">
                        <h3 className="mb-1 line-clamp-1 text-base font-semibold text-gray-800">
                          {service.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-base font-bold text-[#DB3F40]">
                            {service.price}
                          </p>
                          <Link
                            to={`/shop/${service.linkPath || "tshirt"}`}
                            className="rounded-full bg-red-50 p-1.5 text-[#DB3F40] transition-colors duration-300 hover:bg-[#DB3F40] hover:text-white"
                          >
                            <FaShoppingCart className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Pagination with fixed height container */}
        {totalPages > 1 && filteredServices.length > 0 && (
          <div className="my-6 flex h-10 items-center justify-center">
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-l-lg border border-r-0 border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                    className={`border border-gray-300 px-3 py-1.5 text-sm font-medium ${
                      currentPage === pageNum
                        ? "z-10 border-[#DB3F40] bg-[#DB3F40] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-r-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="mt-10">
          <div className="flex items-center gap-6 md:mx-auto md:max-w-md md:justify-center">
            <hr className="flex-grow border-t border-gray-200" />
            <span className="text-sm text-gray-400">
              Découvrez notre collection complète
            </span>
            <hr className="flex-grow border-t border-gray-200" />
          </div>
        </div>

        {/* CTA Section - More compact */}
        <div className="mt-10 rounded-xl bg-gradient-to-r from-[#DB3F40] to-[#9E1E20] p-6 text-center shadow-lg md:mx-auto md:max-w-3xl">
          <h3 className="mb-3 text-xl font-bold text-white">
            Vous recherchez des produits personnalisés ?
          </h3>
          <p className="mb-4 text-red-100">
            Contactez-nous pour discuter de vos besoins spécifiques.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center rounded-full bg-white px-6 py-2 font-medium text-[#DB3F40] transition-all duration-300 hover:bg-red-50"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
