import RightSectionCustomize from "../rightSectionCustomize/RightSectionCustomize";
import RightSectionSelectArticles from "../SelectArticle/SelectArticle";

const RightSection = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <RightSectionSelectArticles />
      <RightSectionCustomize />
    </div>
  );
};
export default RightSection;
