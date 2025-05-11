import { useNavigate, useLocation } from "react-router-dom";
import { Article } from "../../interfaces/CanvasSliceInterfaces";
import { useEffect, useState, useRef } from "react";
import { useShop } from "../../contexts/ShopContext";
import { FaChevronDown, FaTshirt, FaMugHot, FaHatCowboy } from "react-icons/fa";
import { GiPolarStar } from "react-icons/gi";

const SelectArticle = () => {
  const { articles, frontCanvas, backCanvas, changeArticle } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentArticle = articles.find(
    (article: Article) =>
      article.articleName === location.pathname.split("/")[2]
  );

  useEffect(() => {
    const isExist = articles.find(
      (article: Article) =>
        article.articleName === location.pathname.split("/")[2]
    );
  }, [articles, location.pathname]);

  const handleSelect = (selectedArticle: Article) => {
    // Clear any active objects before changing article
    if (backCanvas) {
      backCanvas.discardActiveObject();
      backCanvas.renderAll();
    }

    if (frontCanvas) {
      frontCanvas.discardActiveObject();
      frontCanvas.renderAll();
    }

    // Use context method instead of dispatch
    changeArticle(selectedArticle);

    // Navigate to the desired path based on the article
    navigate(`/shop/${selectedArticle.articleName}`);
    setIsOpen(false);
  };

  useEffect(() => {
    const selectedArticle = articles.find(
      (article: Article) =>
        article.articleName === location.pathname.split("/")[2]
    );

    if (selectedArticle) {
      changeArticle(selectedArticle);
    }
  }, [location.pathname, articles, changeArticle]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to determine the appropriate icon based on article name
  const getArticleIcon = (articleName: string) => {
    const name = articleName.toLowerCase();
    if (
      name.includes("shirt") ||
      name.includes("t-shirt") ||
      name.includes("tshirt")
    ) {
      return <FaTshirt className="text-[#DB3F40]" />;
    } else if (name.includes("cup") || name.includes("mug")) {
      return <FaMugHot className="text-[#DB3F40]" />;
    } else if (name.includes("hat") || name.includes("cap")) {
      return <FaHatCowboy className="text-[#DB3F40]" />;
    } else {
      // Default icon for other items
      return <GiPolarStar className="text-[#DB3F40]" />;
    }
  };

  // Function to get icon with appropriate styling
  const getStyledIcon = (articleName: string, isActive: boolean = false) => {
    const name = articleName.toLowerCase();
    const colorClass = isActive ? "text-[#DB3F40]" : "text-gray-400";

    if (
      name.includes("shirt") ||
      name.includes("t-shirt") ||
      name.includes("tshirt")
    ) {
      return <FaTshirt className={colorClass} />;
    } else if (name.includes("cup") || name.includes("mug")) {
      return <FaMugHot className={colorClass} />;
    } else if (name.includes("hat") || name.includes("cap")) {
      return <FaHatCowboy className={colorClass} />;
    } else {
      return <GiPolarStar className={colorClass} />;
    }
  };

  return (
    <div className="relative w-64" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#DB3F40] focus:ring-opacity-50"
      >
        <div className="flex items-center gap-2 truncate">
          {currentArticle ? (
            getArticleIcon(currentArticle.articleName)
          ) : (
            <FaTshirt className="text-[#DB3F40]" />
          )}
          <span className="truncate">
            {currentArticle
              ? currentArticle.articleName
              : "Sélectionner un article"}
          </span>
        </div>
        <FaChevronDown
          className={`ml-2 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => handleSelect(article)}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                currentArticle?.id === article.id
                  ? "bg-gray-50 font-medium text-[#DB3F40]"
                  : "text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {getStyledIcon(
                  article.articleName,
                  currentArticle?.id === article.id
                )}
                <span>{article.articleName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectArticle;
