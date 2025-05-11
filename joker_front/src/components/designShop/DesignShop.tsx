import { useEffect, useContext } from "react";
import { useShop } from "../../contexts/ShopContext";
import FabricCanvasBack from "../fabricCanvas/FabricCanvasBack";
import FabricCanvasFront from "../fabricCanvas/FabricCanvasFront";
import { FaPencilAlt } from "react-icons/fa";
import { MiniEditorContext } from "../../contexts/MiniEditorContext";

function DesignShop() {
  // Replace Redux selectors with Context hooks
  const { frontCanvas, backCanvas, getCurrentArticle, setActiveSide } =
    useShop();

  const { showMiniEditor, setShowMiniEditor } = useContext(MiniEditorContext);
  const currentArticle = getCurrentArticle();
  const canvasSize = { width: 300, height: 400 };

  return (
    <div className="flex w-full flex-col items-center justify-center p-2 sm:p-4">
      {/* Front/back selection tabs */}
      <div className="mb-3 mt-1 flex w-full justify-center gap-3 sm:mb-4 sm:mt-2 sm:gap-6">
        <button
          onClick={() => {
            setActiveSide("front");
            if (backCanvas) {
              backCanvas.discardActiveObject();
              backCanvas.renderAll();
            }
          }}
          className={`relative flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 transition-all hover:scale-105 sm:h-16 sm:w-16 md:h-20 md:w-20 ${
            currentArticle.active === "front"
              ? "border-[#DB3F40] shadow-md"
              : "border-gray-200 opacity-70 hover:border-gray-300"
          }`}
          aria-label="View front side"
        >
          <img
            src={currentArticle.articleFrontSideInfo.src}
            alt="Face avant"
            className="h-full w-full object-contain p-1"
          />
          <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-0.5 text-center text-[10px] font-medium text-white">
            Avant
          </span>
        </button>

        {currentArticle.articleBackSideInfo != null && (
          <button
            onClick={() => {
              setActiveSide("back");
              if (frontCanvas) {
                frontCanvas.discardActiveObject();
                frontCanvas.renderAll();
              }
            }}
            className={`relative flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 transition-all hover:scale-105 sm:h-16 sm:w-16 md:h-20 md:w-20 ${
              currentArticle.active === "back"
                ? "border-[#DB3F40] shadow-md"
                : "border-gray-200 opacity-70 hover:border-gray-300"
            }`}
            aria-label="View back side"
          >
            <img
              src={currentArticle.articleBackSideInfo.src}
              alt="Face arrière"
              className="h-full w-full object-contain p-1"
            />
            <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-0.5 text-center text-[10px] font-medium text-white">
              Arrière
            </span>
          </button>
        )}
      </div>

      {/* Canvas wrapper with enhanced mobile styling */}
      <div className="relative mt-1 flex w-full flex-col items-center justify-center rounded-lg sm:mt-2">
        {/* Enhanced touch instructions for mobile - Moved to top */}
        <div className="mb-2 text-center text-[10px] text-gray-600 sm:text-xs">
          <p className="px-1">
            Touchez pour sélectionner • Écartez pour zoomer • Glissez pour
            déplacer
          </p>
        </div>

        {/* Canvas display area with simplified touch handling */}
        <div
          className="canvas-container relative mb-2 flex items-center justify-center overflow-hidden rounded-lg border border-gray-200"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            backgroundColor: "#ffffff",
          }}
        >
          {/* Canvases with mobile touch optimizations */}
          <div className="absolute inset-0 flex items-center justify-center">
            <FabricCanvasFront
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
            />
            <FabricCanvasBack
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
            />
          </div>

          {/* Floating edit button for mobile */}
          <button
            onClick={() => setShowMiniEditor(!showMiniEditor)}
            className="absolute bottom-2 right-2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-[#DB3F40] text-white shadow-lg md:hidden"
            aria-label="Toggle editor"
          >
            <FaPencilAlt />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DesignShop;
