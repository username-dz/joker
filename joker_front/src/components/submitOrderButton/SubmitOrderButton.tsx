import { useShop } from "../../contexts/ShopContext";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SubmitOrderButtonProps {
  setIsModelOpen: (isOpen: boolean) => void;
}

const SubmitOrderButton = ({ setIsModelOpen }: SubmitOrderButtonProps) => {
  const { frontCanvas, backCanvas, selectedLayer, setSelectedLayer } =
    useShop();

  const handleOrderClick = () => {
    try {
      // First clear layer selection in context
      setSelectedLayer(null);
      console.log("Layer deselected in Context");

      // Function to properly deselect everything on a canvas
      const clearCanvasSelection = (canvas: any, canvasName: string) => {
        if (!canvas) {
          console.log(`${canvasName} is null, skipping`);
          return false;
        }

        try {
          console.log(`Clearing selection on ${canvasName}`);

          // Get all objects and exit editing mode for any text objects
          if (canvas._objects && canvas._objects.length > 0) {
            canvas._objects.forEach((obj: any) => {
              if (obj.type === "textbox" && obj.isEditing) {
                console.log("Exiting text editing mode");
                obj.exitEditing();
              }
            });
          }

          // Get any active object
          const activeObject = canvas.getActiveObject();
          if (activeObject) {
            console.log("Found active object, discarding");
          }

          // Discard active object and render
          canvas.discardActiveObject();

          // Temporarily disable selection
          const hadSelection = canvas.selection;
          canvas.selection = false;

          // Force a complete render
          canvas.requestRenderAll();

          // Log success
          console.log(`Selection cleared on ${canvasName}`);

          // Return the original selection state
          return hadSelection;
        } catch (e) {
          console.error(`Error clearing ${canvasName} selection:`, e);
          return false;
        }
      };

      // Clear both canvases
      const frontHadSelection = clearCanvasSelection(
        frontCanvas,
        "frontCanvas",
      );
      const backHadSelection = clearCanvasSelection(backCanvas, "backCanvas");

      // Open modal after a short delay to ensure canvas updates
      setTimeout(() => {
        // Restore selection capability
        if (frontCanvas && frontHadSelection) frontCanvas.selection = true;
        if (backCanvas && backHadSelection) backCanvas.selection = true;

        setIsModelOpen(true);
      }, 100);
    } catch (error) {
      console.error("Error in handleOrderClick:", error);
      setIsModelOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleOrderClick}
        className="mb-24 flex w-full items-center justify-center gap-3 rounded-lg bg-[#141E46] px-4 py-2 text-white duration-300 hover:opacity-80"
      >
        <FontAwesomeIcon icon={faShoppingCart} />
        Order Now
      </button>
    </>
  );
};

export default SubmitOrderButton;
