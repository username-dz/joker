import { useShop } from "../../contexts/ShopContext";
import { TextOptionsId } from "../../interfaces/CanvasSliceInterfaces";

interface FontSizeCustomizeProps {
  canvasText: TextOptionsId;
}

const FontSizeCustomize = ({ canvasText }: FontSizeCustomizeProps) => {
  const { selectedLayer, editText } = useShop();

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        <input
          type="number"
          className="w-12 gap-2 py-2 px-3 text-center bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#141E46] focus:border-transparent transition-all"
          placeholder="16"
          min={0}
          max={100}
          value={canvasText?.fontSize}
          onChange={(value) => {
            editText({
              id: selectedLayer?.id,
              fontSize: parseInt(value.target.value),
            });
          }}
        />
      </div>
    </div>
  );
};

export default FontSizeCustomize;