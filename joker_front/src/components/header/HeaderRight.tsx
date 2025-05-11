import { HashLink } from "react-router-hash-link";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import classNames from "classnames";
import CartAndSearch from "./HeaderIcon";
import { useAuth } from "../../contexts/AuthContext"; // Add auth context import
import {
  MdDashboardCustomize,
  MdShoppingCart,
  MdCall,
  MdHome,
  MdAdd,
  MdAdminPanelSettings, // New icon for admin dashboard
} from "react-icons/md";

interface NavLink {
  name: string;
  link: string;
}

interface MobileNavLink {
  name: string;
  link: string;
  icon: JSX.Element;
}

const navLinks: NavLink[] = [
  { name: "Accueil", link: "/" },
  { name: "Services", link: "/#services" },
  { name: "Boutique", link: "/design/" },
  { name: "Mes commandes", link: "/my-orders" },
  { name: "Contact", link: "/contact" },
];

const mobileNavLinks: MobileNavLink[] = [
  { name: "Accueil", link: "/", icon: <MdHome /> },
  { name: "Boutique", link: "/design/", icon: <MdDashboardCustomize /> },
  { name: "Nos services", link: "/#services", icon: <MdAdd /> },
  { name: "Mes commandes", link: "/my-orders", icon: <MdShoppingCart /> },
  { name: "Contact", link: "/contact", icon: <MdCall /> },
];

const HeaderRight = () => {
  const [activeSection, setActiveSection] = useState<string>("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { isAdmin } = useAuth(); // Get admin status from auth context

  // helper function to check active section
  const isActive = (link: string): boolean => {
    const [path, hash] = link.split("#");
    if (link === "/") {
      return location.pathname === "/" && !location.hash && !activeSection;
    }
    if (activeSection && hash === activeSection) {
      return true;
    }
    if (hash) {
      return (
        location.pathname === path &&
        location.hash === `#${hash}` &&
        !activeSection
      );
    }
    return location.pathname === link;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void =>
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveSection("");
  };

  // Create dashboard links that will only be shown to admins
  const adminMobileLink = isAdmin && (
    <li>
      <HashLink
        to="/dashboard/overview"
        className={classNames(
          "flex flex-col items-center justify-center gap-1",
          isActive("/dashboard/overview") ? "text-[#DB3F40]" : "text-gray-500"
        )}
      >
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#DB3F40] text-white">
          <MdAdminPanelSettings size={20} />
        </div>
        <span className="text-xs">Admin</span>
      </HashLink>
    </li>
  );

  return (
    <>
      <ul className="hidden sm:gap-6 lg:flex lg:items-center lg:justify-center lg:px-9">
        {navLinks.map((section) => (
          <li key={section.link} className="p-2">
            <HashLink
              to={section.link}
              className={classNames(
                "font-medium capitalize duration-300 hover:text-primaryColor",
                {
                  "text-primaryColor": isActive(section.link),
                }
              )}
            >
              {section.name}
            </HashLink>
          </li>
        ))}

        {/* Admin dashboard link (desktop) - without icon */}
        {isAdmin && (
          <li className="p-2">
            <HashLink
              to="/dashboard/overview"
              className={classNames(
                "font-medium capitalize duration-300 hover:text-primaryColor",
                {
                  "text-primaryColor": isActive("/dashboard/overview"),
                }
              )}
            >
              Dashboard
            </HashLink>
          </li>
        )}
      </ul>

      <div className="hidden lg:block">{/* <CartAndSearch /> */}</div>

      {/* mobile bottom nav*/}
      <nav
        ref={menuRef}
        className={classNames(
          "z-99 fixed bottom-0 left-0 right-0 mt-2 border-t border-[#f9f9f9] bg-[#fffdfd] p-0 transition-transform duration-500 ease-in-out lg:hidden"
        )}
      >
        <ul className="flex items-center justify-around py-4">
          {mobileNavLinks.map((section) => (
            <li key={section.link}>
              <HashLink
                to={section.link}
                onClick={() => {
                  if (section.link === "/") handleHomeClick();
                }}
                className={classNames(
                  "flex items-center justify-center rounded-full p-2 duration-300 hover:bg-gray-100",
                  {
                    "text-primaryColor": isActive(section.link),
                    "text-gray-500": !isActive(section.link),
                    "bg-red-200": section.name === "Nos services",
                  }
                )}
              >
                <section.icon.type
                  className={classNames(
                    "h-9 w-9",
                    isActive(section.link)
                      ? "text-primaryColor"
                      : "text-gray-500",
                    {
                      "text-primaryColor": section.name === "Nos services",
                    }
                  )}
                />
              </HashLink>
            </li>
          ))}
          {adminMobileLink} {/* Add admin link for mobile if user is admin */}
        </ul>
      </nav>
    </>
  );
};

export default HeaderRight;
