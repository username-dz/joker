import { useState } from "react";
import { HashLink } from "react-router-hash-link";
import heroImage from "/joker_bg.webp";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#DB3F40] to-[#9E1E20] py-16 md:py-24">
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white opacity-10"></div>
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white opacity-10"></div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-10 md:flex-row md:justify-between">
          {/* Hero Text */}
          <div className="w-full md:w-1/2" data-aos="fade-right">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              <span className="block">Designs Personnalisés</span>
              <span className="block">
                En Toute <span className="text-yellow-300">Simplicité</span>
              </span>
            </h1>
            <p className="mb-8 max-w-md text-xl text-red-100">
              Transformez vos idées en t-shirts, sweats, casquettes et plus avec
              nos services d'impression professionnels
            </p>
            <div className="flex flex-wrap gap-4">
              <HashLink
                to="/design/"
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#DB3F40] shadow-lg transition duration-300 hover:bg-red-50"
              >
                Commencer à Concevoir
                <FaArrowRight />
              </HashLink>
              <HashLink
                to="#services"
                className="rounded-full border-2 border-white px-6 py-3 font-medium text-white transition duration-300 hover:bg-white hover:text-[#DB3F40]"
              >
                Nos Services
              </HashLink>
            </div>
          </div>

          {/* Hero Image with Fixed Height Container */}
          <div className="w-full md:w-1/2">
            <div className="relative mx-auto flex min-h-[300px] items-center justify-center sm:min-h-[350px] md:min-h-[400px]">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                </div>
              )}

              <motion.img
                src={heroImage}
                alt="Présentation Joker Graphics"
                className="mx-auto w-full max-w-md md:max-w-lg"
                style={{
                  transition: "opacity 0.5s",
                  opacity: imageLoaded ? 1 : 0,
                }}
                loading="eager"
                onLoad={() => setImageLoaded(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
