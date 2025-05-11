import { useEffect } from "react";
import {
  FaPaintBrush,
  FaUsers,
  FaLightbulb,
  FaQuoteLeft,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const AboutUs = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <section id="about" className="relative overflow-hidden py-16 lg:py-24">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-gradient-to-r from-[#DB3F40] to-[#9E1E20]"></div>
        <div className="bg-pattern absolute inset-0 opacity-10"></div>
      </div>

      {/* Decorative circles */}
      <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-white opacity-10 lg:h-64 lg:w-64"></div>
      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-white opacity-10 lg:h-64 lg:w-64"></div>

      <div className="container relative z-10 mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-12 text-center" data-aos="fade-up">
            <h6 className="mb-2 inline-block rounded-full bg-white bg-opacity-20 px-4 py-1 text-sm font-medium uppercase tracking-wide text-white">
              Notre Histoire
            </h6>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              À propos de{" "}
              <span className="text-yellow-300">Joker Graphics</span>
            </h2>
            <div className="mx-auto h-1 w-24 bg-white"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left column - Reduced to 2 cards */}
            <div className="space-y-6" data-aos="fade-right">
              {/* Card 1: Who We Are + Mission combined */}
              <div className="rounded-xl bg-white bg-opacity-10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-opacity-20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <FaUsers className="h-6 w-6 text-[#DB3F40]" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  Qui Nous Sommes
                </h3>
                <p className="text-red-100">
                  Joker Graphic Agency est votre partenaire créatif à Azzaba.
                  Nous sommes spécialisés dans le design et l'impression,
                  donnant vie à votre vision grâce à notre équipe passionnée
                  d'experts.
                </p>
              </div>

              {/* Card 2: Quote/CTA */}
              <div className="rounded-xl bg-white bg-opacity-10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-opacity-20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <FaQuoteLeft className="h-6 w-6 text-[#DB3F40]" />
                </div>
                <p className="mb-6 italic text-white">
                  "De la conception à la création, nous livrons l'excellence
                  dans chaque projet."
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="/design"
                    className="inline-flex items-center rounded-full bg-white px-5 py-2 font-medium text-[#DB3F40] shadow-lg transition duration-300 hover:bg-red-50"
                  >
                    Commencer un Projet
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center rounded-full border-2 border-white px-5 py-2 font-medium text-white transition duration-300 hover:bg-white hover:text-[#DB3F40]"
                  >
                    Contactez-nous
                  </a>
                </div>
              </div>
            </div>

            {/* Right column - Reduced to 2 cards */}
            <div className="space-y-6" data-aos="fade-left">
              {/* Card 1: Creative Design */}
              <div className="rounded-xl bg-white bg-opacity-10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-opacity-20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <FaPaintBrush className="h-6 w-6 text-[#DB3F40]" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  Design Créatif
                </h3>
                <p className="text-red-100">
                  Nos designers apportent créativité et expertise à chaque
                  projet, en concevant des designs uniques qui capturent
                  parfaitement votre vision.
                </p>
              </div>

              {/* Card 2: Innovation + Client Focus combined */}
              <div className="rounded-xl bg-white bg-opacity-10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-opacity-20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <FaLightbulb className="h-6 w-6 text-[#DB3F40]" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  Innovation & Focus Client
                </h3>
                <p className="text-red-100">
                  Nous restons à la pointe des tendances en matière de design
                  tout en priorisant vos besoins, garantissant votre entière
                  satisfaction avec le produit final.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
