import { Link } from "react-router-dom";

const HeaderLeft = () => {
  return (
    <Link to="/" className="flex items-center md:px-2 lg:px-4">
      <img
        src="/joker_logo.png"
        alt="Joker Graphics Logo"
        className="h-16 w-auto sm:h-20 md:h-24 md:w-auto sm:ml-2 md:ml-0" // w-auto ensures no stretching
      />
    </Link>
  );
};

export default HeaderLeft;
