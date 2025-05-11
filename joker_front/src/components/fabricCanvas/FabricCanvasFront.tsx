import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import fixScrolling from "../../utils/FabricScrolling";
import FontFaceObserver from "fontfaceobserver";
import { useShop } from "../../contexts/ShopContext";
import { throttle } from "lodash"; // Import throttle for performance optimization

// Ensure cacheProperties is an array before modifying it
if (!Array.isArray(fabric.Text.prototype.cacheProperties)) {
  fabric.Text.prototype.cacheProperties = [];
}

fabric.Text.prototype.cacheProperties = [
  ...fabric.Text.prototype.cacheProperties,
  "fontWeight",
];

const FabricCanvasFront = ({
  canvasWidth,
  canvasHeight,
}: {
  canvasWidth: number;
  canvasHeight: number;
}) => {
  const {
    setFrontCanvas,
    frontCanvas,
    selectedLayer,
    setSelectedLayer,
    editText,
    editImage,
    getCurrentArticle,
    getCurrentFrontSide,
    resetFrontSide,
  } = useShop();

  // Use ref to track if an object is being modified
  const isModifying = useRef(false);
  // Track pinch-zoom gestures
  const lastDistance = useRef<number | null>(null);
  // Add ref for throttled updates
  const throttledRenderRef = useRef<any>(null);
  // Keep track of pending state updates
  const pendingUpdates = useRef<any>({});
  // State for reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentArticle = getCurrentArticle();
  const currentArticleFrontSide = getCurrentFrontSide();

  const handleResetCanvas = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    if (frontCanvas) {
      const objects = frontCanvas.getObjects();
      if (objects.length > 0) {
        objects.forEach((obj) => frontCanvas.remove(obj));
        frontCanvas.discardActiveObject();
        frontCanvas.requestRenderAll();
      }
      resetFrontSide();
      setShowResetConfirm(false);
    }
  };

  useEffect(() => {
    fixScrolling();

    // Ensure the canvas element exists before initializing Fabric
    const canvasElement = document.getElementById("frontCanvas");
    if (!canvasElement) {
      console.error("Canvas element not found");
      return;
    }

    // Update canvas initialization to enable both scrolling and selection
    const frontCanvasInstance = new fabric.Canvas("frontCanvas", {
      selection: true, // Enable selection
      allowTouchScrolling: true, // Re-enable scrolling while keeping selection possible
      renderOnAddRemove: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: false,
      controlsAboveOverlay: true,
    });

    frontCanvasInstance.set({
      isDrawingMode: false,
      skipTargetFind: false,
      centeredScaling: true,
      centeredRotation: true,
    });

    // Specific settings for better mobile interaction
    if ("ontouchstart" in document.documentElement) {
      // For mobile, make controls even bigger
      frontCanvasInstance.set({
        defaultCursor: "pointer",
        hoverCursor: "pointer",
        freeDrawingCursor: "pointer",
        moveCursor: "pointer",
        rotationCursor: "pointer",
      });
    }

    // Create throttled render function
    throttledRenderRef.current = throttle(() => {
      if (frontCanvasInstance) {
        frontCanvasInstance.requestRenderAll();
      }
    }, 16); // ~60fps

    // Create a throttled state update function
    const throttledStateUpdate = throttle((obj: any) => {
      if (!obj || !obj.id) return;

      const updates = pendingUpdates.current[obj.id];
      if (!updates) return;

      if (obj.type === "textbox") {
        editText(updates);
      } else if (obj.type === "image") {
        editImage(updates);
      }

      // Clear pending updates after applying them
      pendingUpdates.current[obj.id] = null;
    }, 100); // Update state at most every 100ms

    // Function to queue updates instead of applying immediately
    const queueStateUpdate = (obj: any, updates: any) => {
      if (!obj || !obj.id) return;

      // Store updates to be applied later
      pendingUpdates.current[obj.id] = {
        ...pendingUpdates.current[obj.id],
        ...updates,
        id: obj.id,
      };

      // Schedule the update
      throttledStateUpdate(obj);
    };

    setFrontCanvas(frontCanvasInstance);

    return () => {
      // Cancel any pending operations
      if (throttledRenderRef.current) {
        throttledRenderRef.current.cancel();
      }
      if (throttledStateUpdate) {
        throttledStateUpdate.cancel();
      }
      frontCanvasInstance.dispose();
    };
  }, [canvasWidth, canvasHeight]);

  // Enhanced background image handling
  useEffect(() => {
    if (!frontCanvas || !currentArticleFrontSide) return;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = currentArticleFrontSide.src;

    image.onerror = () => {
      console.error("Error loading front canvas background image");
    };

    image.onload = () => {
      if (!frontCanvas) return;

      // Create fabric image object for background
      const canvasBGImage = new fabric.FabricImage(image);

      // Apply background color if present
      if (currentArticle.articleBackground) {
        canvasBGImage.backgroundColor = currentArticle.articleBackground;
      }

      // Calculate scaling to fit the canvas while preserving aspect ratio
      let scaleX = canvasWidth / image.width;
      let scaleY = canvasHeight / image.height;
      const scale = Math.min(scaleX, scaleY);

      // Apply proper scaling
      canvasBGImage.scaleX = scale;
      canvasBGImage.scaleY = scale;

      // Ensure image is properly centered
      canvasBGImage.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: "center",
        originY: "center",
        selectable: false,
      });

      // Set as background and render
      frontCanvas.backgroundImage = canvasBGImage;
      frontCanvas.renderAll();
    };
  }, [
    currentArticle?.articleBackground,
    currentArticleFrontSide?.src,
    frontCanvas,
    canvasWidth,
    canvasHeight,
  ]);

  // Add text objects with enhanced mobile support
  useEffect(() => {
    if (!frontCanvas || !currentArticleFrontSide) return;

    // Begin batch rendering operations for better performance
    frontCanvas.discardActiveObject();

    const objects = frontCanvas.getObjects("textbox");
    objects.forEach((obj: any) => {
      frontCanvas.remove(obj);
    });

    for (const canvasText of currentArticleFrontSide.texts || []) {
      const text = new fabric.Textbox(canvasText.text || "", {
        id: canvasText.id,
        width: canvasText.width,
        fontSize: canvasText.fontSize,
        textAlign: canvasText.textAlign,
        splitByGrapheme: true,
        fill: canvasText.fill as string,
        fontStyle: canvasText.fontStyle,
        fontWeight: canvasText.fontWeight === "bold" ? "bold" : "normal",
        underline: canvasText.underline ? true : false,
        left: canvasText.left,
        top: canvasText.top,
        angle: canvasText.angle,
        scaleX: canvasText.scaleX || 1,
        scaleY: canvasText.scaleY || 1,
        // Better text handling with these properties
        lockScalingFlip: true,
        snapAngle: 10,
        // Mobile-optimized controls
        hasBorders: true,
        hasControls: true,
        selectable: true,
        hoverCursor: "move",
        moveCursor: "move",
        // Enhanced mobile experience
        cornerSize: "ontouchstart" in document.documentElement ? 22 : 18, // Larger corners for touch
        transparentCorners: false,
        cornerColor: "#DB3F40",
        cornerStrokeColor: "#ffffff",
        borderColor: "#DB3F40",
        borderDashArray: [4, 4],
        // Better text rendering
        charSpacing: 0,
        lineHeight: 1.2,
        editable: true,
      });

      if (selectedLayer?.id === text.id) {
        frontCanvas.setActiveObject(text);
      }

      // Improved font loading
      const fontFamily = canvasText.fontFamily?.split(`"`)[1];
      if (fontFamily && fontFamily !== "Times New Roman") {
        const font = new FontFaceObserver(fontFamily);

        font
          .load(null, 10000)
          .then(() => {
            if (!frontCanvas) return; // Safety check
            text.set("fontFamily", canvasText.fontFamily as string);
            text._clearCache();
            text.initDimensions();
            frontCanvas.requestRenderAll();
          })
          .catch((err) => {
            console.error("Font loading failed:", err);
            // Fallback to default font
            text.set("fontFamily", "Arial, sans-serif");
            frontCanvas.requestRenderAll();
          });
      }

      // Handle text selection with better mobile support
      text.on("selected", () => {
        if (isModifying.current) return;
        setSelectedLayer({
          id: canvasText.id,
          type: "text",
        });

        // Adjust corner sizes for mobile
        if ("ontouchstart" in document.documentElement) {
          text.set({
            cornerSize: 22,
            borderWidth: 2,
          });
        }
      });

      // Optimized handling for modification
      text.on("modified", (e) => {
        if (!e.target) return;

        // Batch state updates at the end of modification
        editText({
          id: e.target.id,
          left: e.target.left,
          top: e.target.top,
          angle: e.target.angle,
          scaleX: e.target.scaleX,
          scaleY: e.target.scaleY,
        });
      });

      // Handle text editing completion
      text.on("editing:exited", () => {
        editText({ id: text.id, text: text.text });
      });

      frontCanvas.add(text);
    }

    // Complete the batch rendering
    frontCanvas.requestRenderAll();
  }, [currentArticleFrontSide?.texts, frontCanvas]);

  // Add images with enhanced mobile support
  useEffect(() => {
    if (!frontCanvas || !currentArticleFrontSide) return;

    const objects = frontCanvas.getObjects("image");
    const existingImageIds = objects.map((obj: any) => obj.id);

    currentArticleFrontSide.images?.forEach((canvasImage) => {
      if (!existingImageIds.includes(canvasImage.id)) {
        const image = new Image();
        image.crossOrigin = "anonymous"; // Better cross-origin handling
        image.src = canvasImage.src;

        image.onload = () => {
          if (!frontCanvas) return; // Safety check

          const canvasBGImage = new fabric.FabricImage(image, {
            id: canvasImage.id,
            originX: "center",
            originY: "center",
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            angle: canvasImage.angle,
            scaleX: canvasImage.scaleX || 1,
            scaleY: canvasImage.scaleY || 1,
            lockScalingFlip: true,
            snapAngle: 10,
            // Improved cursor handling
            hasBorders: true,
            hasControls: true,
            selectable: true,
            hoverCursor: "move",
            moveCursor: "move",
            // Enhanced mobile experience
            cornerSize: "ontouchstart" in document.documentElement ? 22 : 18,
            transparentCorners: false,
            cornerColor: "#DB3F40",
            cornerStrokeColor: "#ffffff",
            borderColor: "#DB3F40",
            borderDashArray: [4, 4],
          });

          canvasBGImage.on("selected", () => {
            if (isModifying.current) return;
            setSelectedLayer({
              id: canvasBGImage.id,
              type: "image",
            });

            // Adjust corner sizes for mobile
            if ("ontouchstart" in document.documentElement) {
              canvasBGImage.set({
                cornerSize: 22,
                borderWidth: 2,
              });
            }
          });

          canvasBGImage.on("modified", (e) => {
            if (!e.target) return;

            editImage({
              id: e.target.id,
              left: e.target.left,
              top: e.target.top,
              angle: e.target.angle,
              scaleX: e.target.scaleX,
              scaleY: e.target.scaleY,
            });
          });

          frontCanvas.add(canvasBGImage);
          frontCanvas.requestRenderAll();
        };

        // Handle image loading errors
        image.onerror = () => {
          console.error("Error loading image:", canvasImage.src);
        };
      }
    });
  }, [currentArticleFrontSide?.images, frontCanvas]);

  // Remove images handler with better cleanup
  useEffect(() => {
    if (!frontCanvas || !currentArticleFrontSide) return;

    frontCanvas.getObjects().forEach((obj: any) => {
      if (obj.type === "image") {
        const isExist = currentArticleFrontSide.images?.find(
          (img) => img.id === obj.id
        );
        if (!isExist) {
          frontCanvas.remove(obj);
        }
      }
    });
    frontCanvas.requestRenderAll();
  }, [currentArticleFrontSide?.images, frontCanvas]);

  return (
    <div
      className={
        currentArticle.active === "front"
          ? "flex h-full w-full items-center justify-center"
          : "hidden"
      }
      id="frontCanvasContainer"
    >
      <canvas
        id="frontCanvas"
        width={canvasWidth}
        height={canvasHeight}
        className="rounded-lg bg-transparent shadow-sm"
        style={{
          touchAction: "manipulation", // Allow native touch actions but with custom handling
        }}
      />

      {/* Reset Canvas Button */}
      <button
        onClick={handleResetCanvas}
        className="absolute bottom-2 left-4 z-40 flex items-center rounded-lg bg-red-500 px-3 py-2 text-white shadow-lg transition-all hover:bg-red-600"
        aria-label="Effacer le design"
        title="Effacer le design"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span className="text-sm font-medium">Effacer</span>
      </button>
      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed left-0 top-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/50">
          <div className="w-80 rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">
              Réinitialiser la conception
            </h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer tous les éléments de votre
              conception ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmReset}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricCanvasFront;
