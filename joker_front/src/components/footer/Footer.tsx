import { FaFacebook, FaInstagram, FaPhone, FaEnvelope } from "react-icons/fa";
import {

  FaLocationDot,
  FaAngleRight,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="relative mt-20 bg-[#DB3F40] text-white">
      {/* IMPROVED WAVE - More elegant, natural flowing wave */}
      <div className="absolute -top-24 left-0 right-0 h-24 w-full overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-24 w-full"
          style={{ transform: "rotateY(180deg)" }}
        >
          <path
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
            fill="#DB3F40"
          ></path>
        </svg>
      </div>

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-40 left-1/4 h-32 w-32 rounded-full bg-white opacity-5"></div>
        <div className="absolute right-1/4 top-40 h-20 w-20 rounded-full bg-white opacity-5"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 pb-8 pt-10">
        {/* Main Footer Content - 3 columns */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Column 1: Company Info */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-6 flex flex-col items-center md:items-start">
              <div className="relative mb-4 inline-block">
                <div className="absolute -inset-1 rounded-lg bg-white bg-opacity-20 blur-lg"></div>
                <img
                  src="/joker_logo.jpg"
                  alt="Logo Joker Graphics"
                  className="relative h-20 w-20 rounded-lg object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold">Joker Graphics</h2>
            </div>
            <p className="mb-6 text-red-100">
              Donnez vie à votre créativité avec des solutions d'impression
              personnalisées. Votre vision, notre expertise.
            </p>

            {/* Social Media Links */}
            <div className="flex space-x-3">
              {[
                {
                  icon: <FaFacebook size={18} />,
                  label: "Facebook",
                  href: "https://www.facebook.com/JokerGraphics1",
                },
                {
                  icon: <FaInstagram size={18} />,
                  label: "Instagram",
                  href: "https://www.instagram.com/joker.graphics/",
                },
                // { icon: <FaSquareXTwitter size={18} />, label: "X", href: "#" },
                // {
                //   icon: <FaLinkedin size={18} />,
                //   label: "LinkedIn",
                //   href: "#",
                // },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white bg-opacity-10 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#DB3F40] hover:shadow-lg"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-6 text-xl font-bold">Liens Rapides</h3>
            <ul className="space-y-3">
              {[
                { name: "Accueil", href: "/" },
                { name: "Services", href: "/#services" },
                { name: "Boutique", href: "/design" },
                { name: "Mes Commandes", href: "/my-orders" },
              ].map((link, idx) => (
                <li key={idx} className="group">
                  <a
                    href={link.href}
                    className="inline-flex cursor-pointer items-center text-red-100 transition-all duration-300 group-hover:text-white"
                  >
                    <FaAngleRight className="mr-2 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="mb-6 text-xl font-bold">Contactez-Nous</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaLocationDot className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-red-200" />
                <span className="text-red-100">
                  Commune de Azzaba, Skikda, AN 2039, Algérie
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 h-5 w-5 flex-shrink-0 text-red-200" />
                <a
                  href="tel:0697093606"
                  target="_blank"
                  className="text-red-100 transition-colors hover:text-white"
                >
                  0697 09 36 06
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 h-5 w-5 flex-shrink-0 text-red-200" />
                <a
                  target="_blank"
                  href="mailto:jokergraphics@gmail.com"
                  className="text-red-100 transition-colors hover:text-white"
                >
                  jokergraphics@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>

        {/* Copyright Section */}
        <div className="flex items-center justify-center space-y-4">
          <p className="text-sm text-red-100">
            &copy; {new Date().getFullYear()} Joker Graphics. Tous droits
            réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
