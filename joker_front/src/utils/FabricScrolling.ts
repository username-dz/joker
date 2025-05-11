import * as fabric from "fabric";

const fixScrolling = () => {
  // Make control points larger for mobile
  fabric.Object.prototype.cornerSize = 24;
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerColor = "#DB3F40";
  fabric.Object.prototype.cornerStrokeColor = "#ffffff";
  fabric.Object.prototype.borderColor = "#DB3F40";

  // Make text objects more easily selectable
  if (fabric.IText) {
    fabric.IText.prototype.selectionBackgroundColor = "rgba(219, 63, 64, 0.2)";
    fabric.IText.prototype.defaultCursorWidth = 2;
  }

  // Make everything have larger touch target areas
  fabric.Object.prototype.padding = 10;

  // Fix for deselection requiring two clicks on mobile
  const originalMouseDown = fabric.Canvas.prototype._onMouseDown;
  fabric.Canvas.prototype._onMouseDown = function (e) {
    // Track if we had an active object before this click
    const hadActiveObject = !!this.getActiveObject();
    const target = this.findTarget(e);

    // Call original handler
    originalMouseDown.call(this, e);

    // If we had an active object, and clicked on empty canvas (no target)
    // force immediate deselection in one click
    if (hadActiveObject && !target) {
      this.discardActiveObject();
      this.requestRenderAll();
    }
  };

  // Create a better touch start handler that balances scrolling and selection
  const originalTouchStart = fabric.Canvas.prototype._onTouchStart;
  fabric.Canvas.prototype._onTouchStart = function (e) {
    // Track if we had an active object before this touch
    const hadActiveObject = !!this.getActiveObject();

    // Try to find a target object under the touch point
    const target = this.findTarget(e);

    // If we found a target object, handle the selection
    if (target) {
      // Call the original handler to manage the object selection
      originalTouchStart.call(this, e);
    } else {
      // If we had an active object and clicked on empty canvas
      // force immediate deselection in one click
      if (hadActiveObject) {
        this.discardActiveObject();
        this.requestRenderAll();
      }
      // Let browser handle the scroll naturally when no target found
    }
  };
};

export default fixScrolling;
