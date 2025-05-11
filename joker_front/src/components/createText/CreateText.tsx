import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useShop } from "../../contexts/ShopContext";

const CreateText = () => {
  const {
    createText,
    getCurrentArticle,
    frontCanvas,
    backCanvas,
    setSelectedLayer,
  } = useShop();

  const handleCreateText = () => {
    try {
      // Generate a unique ID for the new text
      const textId = uuid();

      // Get the active canvas to determine dimensions
      const activeCanvas =
        getCurrentArticle().active === "front" ? frontCanvas : backCanvas;

      // Get canvas dimensions for positioning text at the top
      const canvasDimensions = activeCanvas
        ? {
            width: activeCanvas.getWidth(),
            height: activeCanvas.getHeight(),
          }
        : { width: 300, height: 400 };

      const newText = {
        id: textId,
        text: "Édite-moi",
        fontFamily: '"Inter", sans-serif',
        fontSize: 30,
        fill: "#000000",
        bold: false,
        angle: 0,
        underline: false,
        width: 200,
        lineHeight: 1,
        textAlign: "center",
        fontStyle: "normal",
        height: 50,
        scaleX: 1,
        scaleY: 1,
        // Position text at the top-left area of the canvas
        left: canvasDimensions.width / 2 - 100, // Moved left from center (was width/2)
        top: 80, // Positioned at the top
      };

      // Create the text object
      createText(newText);

      // Immediately select the newly created text
      setTimeout(() => {
        setSelectedLayer({
          id: textId,
          type: "text",
        });

        // If we have an active canvas, find the text object and set it as active
        if (activeCanvas) {
          const objects = activeCanvas.getObjects();
          const textObject = objects.find((obj: any) => obj.id === textId);
          if (textObject) {
            activeCanvas.setActiveObject(textObject);
            activeCanvas.requestRenderAll();
          }
        }
      }, 100); // Short delay to ensure the text is created before attempting to select it

      toast.success("Text added successfully!");
    } catch (error) {
      toast.error("Failed to add text. Try again.");
      console.error("Error adding text:", error);
    }
  };

  return (
    <button
      onClick={handleCreateText}
      className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#349b11] px-4 py-2 text-white duration-300 hover:opacity-80"
      aria-label="Add Text"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.666 9.61H9.60601V15.82H6.42601V9.61H0.366011V6.73H6.42601V0.519998H9.60601V6.73H15.666V9.61Z"
          fill="white"
        />
      </svg>
      <span className="block md:hidden">Ajouter</span>{" "}
      <span className="hidden md:block">Ajouter du text</span>
    </button>
  );
};

export default CreateText;
