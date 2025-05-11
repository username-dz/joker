import { useState } from "react";
import { useShop } from "../../contexts/ShopContext";

interface ColorPickerProps {
  type: "text" | "articleBackGround";
}

const ColorPicker = ({ type }: ColorPickerProps) => {
  const [fill, setFill] = useState("#000000");
  const { selectedLayer, editText, setArticleBackground } = useShop();

  // Define a set of specified colors
  const colors = [
    "#FF5733", // Orange-red
    "#33FF57", // Light green
    "#3357FF", // Blue
    "#F1C40F", // Yellow
    "#8E44AD", // Purple
    "#FFFFFF", // White
    "#000000", // Black
  ];

  const handleColorChange = (color: string) => {
    setFill(color);

    if (type === "articleBackGround") {
      setArticleBackground(color);
    } else if (selectedLayer) {
      editText({ id: selectedLayer.id, fill: color });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {type === "articleBackGround" && (
        <p className="mb-2 font-medium text-gray-700">
          Couleur de l'arrière-plan
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <div
            key={color}
            className={`h-8 w-8 cursor-pointer rounded-full transition-all duration-200 ${
              fill === color
                ? "ring-2 ring-black ring-offset-2"
                : color === "#FFFFFF"
                  ? "ring-1 ring-gray-300"
                  : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorChange(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
