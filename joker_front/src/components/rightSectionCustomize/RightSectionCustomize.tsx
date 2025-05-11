import { useShop } from "../../contexts/ShopContext";
import FontSizeCustomize from "../textCustomize/FontSizeCustomize";
import { FaBold, FaItalic, FaUnderline } from "react-icons/fa6";
import FontFamilyCustomize from "../textCustomize/FontFamilyCustomize";
import TextColorCustomize from "../textCustomize/FontColorCustomize";
import CreatText from "../createText/CreateText";
import CreateImage from "../createImage/CreateImage";
import DeleteLayer from "../deleteLayer/DeleteLayer";

const TextCustomize = () => {
  const { selectedLayer, editText, getCurrentSelectedText } = useShop();
  const text = getCurrentSelectedText();

  return (
    <div
      className="md:px- flex flex-wrap gap-1 rounded-md bg-[#fcfbfb] p-6 shadow-md sm:gap-6 md:p-6"
      style={{ minHeight: "320px" }}
    >
      {/* Top Buttons Section - Always visible regardless of selection state */}
      <div className="flex w-full justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center">
            <CreatText />
          </div>
          <div className="flex items-center justify-center border-l border-gray-200 pl-4">
            <CreateImage />
          </div>
        </div>
        {selectedLayer && <DeleteLayer />}
      </div>

      {/* Main Content Area with consistent UI structure */}
      <div className="mt-4 w-full">
        {/* Text customization options - shown only when text is selected */}
        {selectedLayer && selectedLayer.type === "text" && text ? (
          <div className="flex w-full flex-col gap-6 transition-opacity duration-200">
            <div className="flex flex-col gap-3">
              <p className="font-medium text-gray-700 ">Couleur du texte</p>
              <div className="flex gap-2">
                <TextColorCustomize />
              </div>
            </div>

            <div className="flex w-full flex-wrap gap-6">
              <div className="flex flex-col gap-3">
                <p className="font-medium text-gray-700">Taille de la police</p>
                <FontSizeCustomize canvasText={text} />
              </div>

              <div className="flex flex-col gap-3">
                <p className="font-medium text-gray-700">Police d'écriture</p>
                <FontFamilyCustomize canvasText={text} />
              </div>

              <div className="flex flex-col gap-3">
                <p className="font-medium text-gray-700">Style du texte</p>
                <div className="flex gap-2">
                  <button
                    className={`flex h-8 w-8 items-center justify-center rounded-md p-2 transition-colors ${
                      text?.fontStyle === "italic"
                        ? "bg-[#141E46] text-white"
                        : "bg-gray-200 text-gray-800"
                    } hover:bg-[#141E46] hover:text-white`}
                    onClick={() =>
                      editText({
                        id: selectedLayer.id,
                        fontStyle:
                          text?.fontStyle === "italic" ? "normal" : "italic",
                      })
                    }
                    aria-label="Texte en italique"
                  >
                    <FaItalic />
                  </button>

                  <button
                    className={`flex h-8 w-8 items-center justify-center rounded-md p-2 transition-colors ${
                      text?.fontWeight === "bold"
                        ? "bg-[#141E46] text-white"
                        : "bg-gray-200 text-gray-800"
                    } hover:bg-[#141E46] hover:text-white`}
                    onClick={() =>
                      editText({
                        id: selectedLayer.id,
                        fontWeight:
                          text?.fontWeight === "bold" ? "normal" : "bold",
                      })
                    }
                    aria-label="Texte en gras"
                  >
                    <FaBold />
                  </button>

                  <button
                    className={`flex h-8 w-8 items-center justify-center rounded-md p-2 transition-colors ${
                      text?.underline
                        ? "bg-[#141E46] text-white"
                        : "bg-gray-200 text-gray-800"
                    } hover:bg-[#141E46] hover:text-white`}
                    onClick={() =>
                      editText({
                        id: selectedLayer.id,
                        underline: !text?.underline,
                      })
                    }
                    aria-label="Texte souligné"
                  >
                    <FaUnderline />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : selectedLayer && selectedLayer.type === "image" ? (
          // Image selected state - show appropriate message with consistent height
          <div className="flex h-48 items-center justify-center">
            <p className="text-center text-gray-600">
              Utilisez les contrôles sur l'image pour la redimensionner ou la
              faire pivoter
            </p>
          </div>
        ) : (
          // Nothing selected state - show helpful guidance with consistent height
          <div className="flex h-48 items-center justify-center">
            <p className="text-center text-gray-600">
              Utilisez les boutons ci-dessus pour ajouter du texte ou une image,
              puis sélectionnez un élément pour le modifier
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextCustomize;
