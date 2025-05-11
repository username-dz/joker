import { Link } from "react-router-dom";
import {
  faTshirt,
  faMugHot,
  faHatCowboy,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

const articles = [
  {
    name: "T-shirt",
    icon: faTshirt,
    link: "/shop/tshirt",
    description: "Des designs personnalisés sur des t-shirts de haute qualité",
    price: "5000 DA",
    image: "/tshirt.png",
  },
  {
    name: "Sweatshirt",
    icon: faTshirt,
    link: "/shop/tshirt",
    description: "Des sweatshirts confortables avec votre design",
    price: "6500 DA",
    image: "/crew_front.png",
  },
  {
    name: "Hoodie",
    icon: faTshirt,
    link: "/shop/tshirt",
    description: "Des hoodies stylés avec impression personnalisée",
    price: "7000 DA",
    image: "/frontTshirt(1).png",
  },
  {
    name: "Mug",
    icon: faMugHot,
    link: "/shop/cup",
    description: "Vos designs préférés sur des mugs de qualité",
    price: "1500 DA",
    image: "/cuptest.png",
  },
  {
    name: "Casquette",
    icon: faHatCowboy,
    link: "/shop/hat",
    description: "Casquettes personnalisées pour toutes les occasions",
    price: "2500 DA",
    image: "/hat.png",
  },
  {
    name: "Porte-clés",
    icon: faKey,
    link: "/shop/keyring",
    description: "Porte-clés personnalisés avec vos designs",
    price: "800 DA",
    image: "/tshirt2.png",
  },
];

const Articles = () => {
  const [animatedItems, setAnimatedItems] = useState<number[]>([]);

  useEffect(() => {
    // Stagger the animation of items
    const timer = setTimeout(() => {
      const indices = Array.from({ length: articles.length }, (_, i) => i);
      setAnimatedItems(indices);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16 pb-24">
      <div className="container mx-auto px-6">
        {/* Hero Section with animated text */}
        <div className="mb-16 text-center">
          <h1 className="mb-3 text-5xl font-extrabold tracking-tight text-gray-900">
            <span className="bg-gradient-to-r from-[#DB3F40] to-purple-600 bg-clip-text text-transparent">
              Découvrez Nos Produits
            </span>
          </h1>
          <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-[#DB3F40] to-purple-600"></div>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            Choisissez parmi notre gamme de produits personnalisables et créez
            votre propre design unique qui vous représente parfaitement.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <div
              key={index}
                className={`group relative flex min-h-[24rem] transform flex-col overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                animatedItems.includes(index)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              {/* Product Image Background */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50">
                <img
                  src={article.image}
                  alt={article.name}
                  className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent pb-4 pt-8"></div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                {/* Product Badge */}
                <div className="absolute right-4 top-4 rounded-full bg-[#DB3F40] px-3 py-1 text-xs font-bold text-white shadow-md">
                  {article.price}
                </div>

                <h3 className="mb-3 text-2xl font-bold text-gray-800">
                  {article.name}
                </h3>

                <p className="mb-6 flex-grow text-gray-600">
                  {article.description}
                </p>

                {/* Button Container - Fixed at Bottom */}
                <div className="mt-auto w-full pb-1">
                  <Link
                    to={article.link}
                    className="block w-full overflow-visible rounded-lg bg-gradient-to-r from-[#DB3F40] to-[#f05545] px-4 py-3 text-center font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    Personnaliser Maintenant
                    <svg
                      className="ml-2 inline-block h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
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
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mx-auto mt-24 max-w-4xl rounded-2xl bg-gradient-to-r from-[#DB3F40] to-purple-600 p-1 shadow-2xl">
          <div className="rounded-xl bg-white p-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Besoin d'aide pour votre design?
            </h2>
            <p className="mb-6 text-gray-600">
              Notre équipe de designers est prête à vous aider à créer le
              produit parfait selon vos besoins.
            </p>
            <Link
              to="/contact"
              className="inline-block rounded-lg bg-gradient-to-r from-[#DB3F40] to-purple-600 px-8 py-3 font-semibold text-white transition-all hover:opacity-90"
            >
              Contactez-nous
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Articles;
