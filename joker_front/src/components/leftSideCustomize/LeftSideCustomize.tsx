import LeftSideCustomizeBody from "./LeftSideCustomizeBody";
import LeftSideCustomizeHeader from "./LeftSideCustomizeHeader";

const LeftSideCustomize = () => {
  return (
    <div className="flex max-w-[600px] flex-row flex-wrap items-center justify-center gap-4 rounded-xl border-2 bg-white p-4 px-6 text-center text-black md:h-[470px] md:flex-col">
      <LeftSideCustomizeHeader />
      <LeftSideCustomizeBody />
    </div>
  );
};
export default LeftSideCustomize;
