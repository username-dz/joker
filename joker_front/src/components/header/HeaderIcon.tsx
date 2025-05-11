import { useState, useEffect, useRef } from "react";
import { IoMdSearch } from "react-icons/io";
import { MdOutlineShoppingCart } from "react-icons/md";
import { Link } from "react-router-dom";
import articlesInitialState from "../../data/data";
import { HashLink } from "react-router-hash-link";

const CartAndSearch = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArticles, setFilteredArticles] =
    useState(articlesInitialState);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearch]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredArticles(articlesInitialState);
    } else {
      const filtered = articlesInitialState.filter((article) =>
        article.articleName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredArticles(filtered);
    }
  }, [searchTerm]);

  return (
    <div className="mr-24 flex items-center gap-4 pl-4">
      <div className="relative" ref={searchRef}>
        <IoMdSearch
          onClick={() => setShowSearch(!showSearch)}
          className="size-6 cursor-pointer duration-300 hover:text-[#DB3F40] md:inline-block"
          aria-label="Rechercher"
        />

        <div
          className={
            !showSearch
              ? "hidden"
              : "absolute -left-44 top-10 h-96 w-64 overflow-y-auto overflow-x-hidden rounded-lg border border-gray-300 bg-white p-2"
          }
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 outline-none"
            placeholder="Rechercher..."
          />
          <div className="py-4">
            <p className="font-semibold">Articles</p>
            <div>
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <div key={article.id} className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-1 flex-col gap-2">
                        <p>{article.articleName}</p>
                        <p className="text-red-500">
                          Prix: {article.articlePrice}
                        </p>
                      </div>
                      <HashLink to={"/shop?id=" + article.id}>
                        <img
                          className="h-28"
                          src={article.articleFrontSideInfo.src}
                          alt={article.articleName}
                        />
                      </HashLink>
                    </div>
                  </div>
                ))
              ) : (
                <p>Aucun article trouvé</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Link to="/cart" aria-label="Panier">
        <MdOutlineShoppingCart className="size-6 cursor-pointer duration-300 hover:text-[#DB3F40] md:inline-block" />
      </Link>
    </div>
  );
};

export default CartAndSearch;
