import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import fixScrolling from "../../utils/FabricScrolling";
import FontFaceObserver from "fontfaceobserver";
import { useShop } from "../../contexts/ShopContext";
import { throttle } from "lodash"; // Import throttle for performance optimization

// Define fabric types to fix TypeScript errors
// This helps TypeScript understand our custom properties and methods
declare module "fabric" {
  namespace fabric {
    interface IText {
      _clearCache(): void;
      initDimensions(): void;
    }

    interface Object {
      id?: string;
      getScaledWidth(): number;
      getScaledHeight(): number;
    }

    interface Canvas {
      discardActiveObject(): fabric.Canvas;
      requestRenderAll(): fabric.Canvas;
      getObjects(type?: string): fabric.Object[];
    }

    // Use interface instead of class extension to fix the TypeScript error
    interface FabricImage extends fabric.Object {
      id?: string;
      backgroundColor?: string;
      set(options: any): fabric.Object;
      on(event: string, handler: Function): fabric.Object;
    }
  }
}

// Ensure cacheProperties is an array before modifying it
if (!Array.isArray(fabric.Text.prototype.cacheProperties)) {
  fabric.Text.prototype.cacheProperties = [];
}

fabric.Text.prototype.cacheProperties = [
  ...fabric.Text.prototype.cacheProperties,
  "fontWeight",
];

const FabricCanvasBack = ({
  canvasWidth,
  canvasHeight,
}: {
  canvasWidth: number;
  canvasHeight: number;
}) => {
  const {
    setBackCanvas,
    backCanvas,
    selectedLayer,
    setSelectedLayer,
    editText,
    editImage,
    getCurrentArticle,
    getCurrentBackSide,
    resetBackSide,
  } = useShop();

  // Use ref to track if an object is being modified
  const isModifying = useRef(false);
  // Track pinch-zoom gestures
  const lastDistance = useRef<number | null>(null);
  // Add ref for throttled updates
  const throttledRenderRef = useRef<ReturnType<typeof throttle> | null>(null);
  // Keep track of pending state updates
  const pendingUpdates = useRef<Record<string, any>>({});
  // Track if background is loaded
  const [backImageLoaded, setBackImageLoaded] = useState(false);
  // Track canvas initialization state
  const canvasInitialized = useRef(false);
  // Track reset confirmation modal visibility
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentArticle = getCurrentArticle();
  const currentArticleBackSide = getCurrentBackSide();

  const handleResetCanvas = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    if (backCanvas) {
      const objects = backCanvas.getObjects();
      if (objects.length > 0) {
        objects.forEach((obj) => backCanvas.remove(obj));
        backCanvas.discardActiveObject();
        backCanvas.requestRenderAll();
      }
      resetBackSide();
      setShowResetConfirm(false);
    }
  };

  useEffect(() => {
    fixScrolling();

    // Ensure the canvas element exists before initializing Fabric
    const canvasElement = document.getElementById("backCanvas");
    if (!canvasElement) {
      console.error("Canvas element not found");
      return;
    }

    // Update canvas initialization to enable both scrolling and selection
    const backCanvasInstance = new fabric.Canvas("backCanvas", {
      selection: true, // Enable selection
      allowTouchScrolling: true, // Re-enable scrolling while keeping selection possible
      renderOnAddRemove: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: false,
      controlsAboveOverlay: true,
    });

    backCanvasInstance.set({
      isDrawingMode: false,
      skipTargetFind: false,
      centeredScaling: true,
      centeredRotation: true,
    });

    // Specific settings for better mobile interaction
    if ("ontouchstart" in document.documentElement) {
      // For mobile, make controls even bigger
      backCanvasInstance.set({
        defaultCursor: "pointer",
        hoverCursor: "pointer",
        freeDrawingCursor: "pointer",
        moveCursor: "pointer",
        rotationCursor: "pointer",
      });
    }

    // Create throttled render function
    throttledRenderRef.current = throttle(() => {
      if (backCanvasInstance) {
        backCanvasInstance.requestRenderAll();
      }
    }, 16); // ~60fps

    // Create a throttled state update function
    const throttledStateUpdate = throttle((obj: fabric.Object) => {
      if (!obj || !obj.id) return;

      const updates = pendingUpdates.current[obj.id];
      if (!updates) return;

      // TypeScript safe check for object type
      if (obj.type === "textbox") {
        editText(updates);
      } else if (obj.type === "image") {
        editImage(updates);
      }

      // Clear pending updates after applying them
      pendingUpdates.current[obj.id] = null;
    }, 100); // Update state at most every 100ms

    // Function to queue updates instead of applying immediately
    const queueStateUpdate = (obj: fabric.Object, updates: any) => {
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

    // Add event listener for object:moving
    backCanvasInstance.on("object:moving", (e) => {
      if (!isModifying.current || !e.target) return;

      const obj = e.target;
      const objWidth = obj.getScaledWidth();
      const objHeight = obj.getScaledHeight();
      const margin = 0;

      // Keep object within canvas boundaries
      let left = Math.max(
        margin - objWidth / 2,
        Math.min(canvasWidth - objWidth / 2 - margin, obj.left || 0)
      );
      let top = Math.max(
        margin - objHeight / 2,
        Math.min(canvasHeight - objHeight / 2 - margin, obj.top || 0)
      );

      // Only update if position changed
      if ((left !== obj.left || top !== obj.top) && obj.set) {
        obj.set({
          left: left,
          top: top,
        });
      }

      // Use the throttled render
      if (throttledRenderRef.current) {
        throttledRenderRef.current();
      }
    });

    setBackCanvas(backCanvasInstance);
    canvasInitialized.current = true;

    return () => {
      // Cancel any pending operations
      if (throttledRenderRef.current) {
        throttledRenderRef.current.cancel();
      }
      if (throttledStateUpdate) {
        throttledStateUpdate.cancel();
      }
      backCanvasInstance.dispose();
      canvasInitialized.current = false;
      setBackImageLoaded(false);
    };
  }, [canvasWidth, canvasHeight, setBackCanvas]);

  // Enhanced background image handling
  useEffect(() => {
    if (!backCanvas || !currentArticleBackSide) return;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = currentArticleBackSide.src;

    image.onerror = () => {
      console.error("Error loading back canvas background image");
      setBackImageLoaded(false);
    };

    image.onload = () => {
      if (!backCanvas) return;

      // Create fabric image object for background
      const canvasBGImage = new fabric.Image(image);

      // Apply background color if present
      if (currentArticle && currentArticle.articleBackground) {
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

      // Clear any existing background image
      backCanvas.backgroundImage = null;

      // Set as background and render
      backCanvas.backgroundImage = canvasBGImage;
      backCanvas.requestRenderAll();
      setBackImageLoaded(true);

      // Log successful loading of back image for debugging
      console.log("Back canvas background image loaded successfully");
    };
  }, [
    currentArticle?.articleBackground,
    currentArticleBackSide?.src,
    backCanvas,
    canvasWidth,
    canvasHeight,
  ]);

  // Force render when article changes or active side changes
  useEffect(() => {
    if (backCanvas && currentArticleBackSide) {
      // Short delay to ensure proper rendering
      setTimeout(() => {
        backCanvas.requestRenderAll();
      }, 200);
    }
  }, [
    currentArticle?.id,
    currentArticle?.active,
    backCanvas,
    currentArticleBackSide,
  ]);

  // Force render the back canvas periodically even if not visible
  // This ensures it's always ready for capture
  useEffect(() => {
    if (backCanvas && canvasInitialized.current && currentArticleBackSide) {
      const intervalId = setInterval(() => {
        // Only force render if the background image is loaded
        if (backImageLoaded) {
          backCanvas.requestRenderAll();
        }
      }, 3000); // Refresh every 3 seconds

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [backCanvas, currentArticleBackSide, backImageLoaded]);

  // Add text objects with enhanced mobile support
  useEffect(() => {
    if (!backCanvas || !currentArticleBackSide) return;

    // Begin batch rendering operations for better performance
    backCanvas.discardActiveObject();

    const objects = backCanvas.getObjects("textbox");
    objects.forEach((obj: fabric.Object) => {
      backCanvas.remove(obj);
    });

    for (const canvasText of currentArticleBackSide.texts || []) {
      // Safe type casting for fabric.js
      const textOptions: fabric.ITextOptions & { id: string } = {
        id: canvasText.id,
        width: canvasText.width,
        fontSize: canvasText.fontSize,
        textAlign: canvasText.textAlign as fabric.TextAlign,
        splitByGrapheme: true,
        fill: canvasText.fill as string,
        fontStyle: canvasText.fontStyle as any,
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
        cornerSize: "ontouchstart" in document.documentElement ? 22 : 18,
        transparentCorners: false,
        cornerColor: "#DB3F40",
        cornerStrokeColor: "#ffffff",
        borderColor: "#DB3F40",
        borderDashArray: [4, 4],
        // Better text rendering
        charSpacing: 0,
        lineHeight: 1.2,
        editable: true,
      };

      const text = new fabric.Textbox(canvasText.text || "", textOptions);

      if (selectedLayer?.id === text.id) {
        backCanvas.setActiveObject(text);
      }

      // Improved font loading
      const fontFamily = canvasText.fontFamily?.split(`"`)[1];
      if (fontFamily && fontFamily !== "Times New Roman") {
        const font = new FontFaceObserver(fontFamily);

        font
          .load(null, 10000)
          .then(() => {
            if (!backCanvas) return; // Safety check
            text.set("fontFamily", canvasText.fontFamily as string);
            // These methods are defined in our type extension above
            (text as any)._clearCache();
            (text as any).initDimensions();
            backCanvas.requestRenderAll();
          })
          .catch((err) => {
            console.error("Font loading failed:", err);
            // Fallback to default font
            text.set("fontFamily", "Arial, sans-serif");
            backCanvas.requestRenderAll();
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
      text.on("modified", (e: any) => {
        if (!e.target) return;
        const target = e.target;

        // Batch state updates at the end of modification
        editText({
          id: target.id,
          left: target.left,
          top: target.top,
          angle: target.angle,
          scaleX: target.scaleX,
          scaleY: target.scaleY,
        });
      });

      // Handle text editing completion
      text.on("editing:exited", () => {
        editText({ id: text.id, text: text.text });
      });

      backCanvas.add(text);
    }

    // Complete the batch rendering
    backCanvas.requestRenderAll();
  }, [
    currentArticleBackSide?.texts,
    backCanvas,
    selectedLayer?.id,
    setSelectedLayer,
    editText,
  ]);

  // Add images with enhanced mobile support
  useEffect(() => {
    if (!backCanvas || !currentArticleBackSide) return;

    const objects = backCanvas.getObjects("image");
    const existingImageIds = objects.map((obj: any) => obj.id);

    currentArticleBackSide.images?.forEach((canvasImage) => {
      if (!existingImageIds.includes(canvasImage.id)) {
        const image = new Image();
        image.crossOrigin = "anonymous"; // Better cross-origin handling
        image.src = canvasImage.src;

        image.onload = () => {
          if (!backCanvas) return; // Safety check

          // Create image options object with proper types
          const imageOptions: fabric.IImageOptions & { id: string } = {
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
          };

          const canvasBGImage = new fabric.Image(image, imageOptions);

          canvasBGImage.on("selected", () => {
            if (isModifying.current) return;
            setSelectedLayer({
              id: canvasBGImage.id || "",
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

          canvasBGImage.on("modified", (e: any) => {
            if (!e.target) return;
            const target = e.target;

            editImage({
              id: target.id,
              left: target.left,
              top: target.top,
              angle: target.angle,
              scaleX: target.scaleX,
              scaleY: target.scaleY,
            });
          });

          backCanvas.add(canvasBGImage);
          backCanvas.requestRenderAll();
        };

        // Handle image loading errors
        image.onerror = () => {
          console.error("Error loading image:", canvasImage.src);
        };
      }
    });
  }, [
    currentArticleBackSide?.images,
    backCanvas,
    canvasWidth,
    canvasHeight,
    setSelectedLayer,
    editImage,
  ]);

  // Remove images handler with better cleanup
  useEffect(() => {
    if (!backCanvas || !currentArticleBackSide) return;

    backCanvas.getObjects().forEach((obj: fabric.Object) => {
      if (obj.type === "image" && obj.id) {
        const isExist = currentArticleBackSide.images?.find(
          (img) => img.id === obj.id
        );
        if (!isExist) {
          backCanvas.remove(obj);
        }
      }
    });
    backCanvas.requestRenderAll();
  }, [currentArticleBackSide?.images, backCanvas]);

  return (
    <div
      className={
        currentArticle.active === "back"
          ? "flex h-full w-full items-center justify-center"
          : "hidden"
      }
      id="backCanvasContainer"
    >
      <canvas
        id="backCanvas"
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

export default FabricCanvasBack;
