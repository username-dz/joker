import HeaderLeft from "./HeaderLeft";
import HeaderRight from "./HeaderRight";

const Header = () => {
  return (
    <header className="relative z-50 w-full bg-[#F1F1F1] md:bg-[#F9F9F9]">
      <nav className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-2 md:px-8">
        <HeaderLeft />
        <HeaderRight />
      </nav>
    </header>
  );
};

export default Header;
