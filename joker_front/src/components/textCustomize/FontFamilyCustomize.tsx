import { useState } from "react";
import { useShop } from "../../contexts/ShopContext";
import { TextOptionsId } from "../../interfaces/CanvasSliceInterfaces";

interface FontFamilyCustomizeProps {
  canvasText: TextOptionsId;
}

const FontFamilyCustomize = ({ canvasText }: FontFamilyCustomizeProps) => {
  const { selectedLayer, editText } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState<string | undefined>(
    canvasText?.fontFamily,
  );

  const fonts = [
    { name: "Times New Roman", value: '"Times New Roman", serif' },
    { name: "Dancing Script", value: '"Dancing Script", sans-serif' },
    { name: "Lobster", value: '"Lobster", cursive' },
    { name: "Pacifico", value: '"Pacifico", cursive' },
    { name: "Montserrat", value: '"Montserrat", sans-serif' },
    { name: "Oswald", value: '"Oswald", sans-serif' },
    { name: "Playfair Display", value: '"Playfair Display", serif' },
    { name: "Raleway", value: '"Raleway", sans-serif' },
    { name: "Fira Sans", value: '"Fira Sans", sans-serif' },
  ];

  const handleFontChange = (fontFamily: string) => {
    setSelectedFont(fontFamily);
    setIsOpen(false);
    editText({
      id: selectedLayer?.id,
      fontFamily,
    });
  };

  return (
    <div className="relative w-full md:w-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 transition-all duration-300 ease-in-out hover:border-[#33AA15] focus:border-[#33AA15] focus:ring-2 focus:ring-[#33AA15]"
      >
        {fonts.find((font) => font.value === selectedFont)?.name ||
          "Sélectionner une police"}
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
          {fonts.map((font, index) => (
            <li
              key={index}
              onClick={() => handleFontChange(font.value)}
              className={`cursor-pointer px-3 py-2 transition duration-150 ease-in-out hover:bg-[#33AA15] hover:text-white ${
                selectedFont === font.value ? "bg-[#33AA15] text-white" : ""
              }`}
            >
              {font.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FontFamilyCustomize;
