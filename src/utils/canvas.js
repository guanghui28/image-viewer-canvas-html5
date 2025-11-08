/**
 * Calculates the destination position and size at which an image should be rendered
 * on a given canvas so that it maintains its aspect ratio and fits appropriately
 * within the canvas boundaries. The function considers both image and canvas
 * orientation (landscape/portrait) to determine whether to fit by width or height.
 *
 * @function setupRenderPositionOnCanvas
 * @param {HTMLImageElement} image - The image object (must have `naturalWidth` and `naturalHeight` defined).
 * @param {HTMLCanvasElement} canvas - The target canvas on which the image will be rendered.
 * @returns {{
 *   desX: number,      // The x-coordinate where the image should be drawn on the canvas.
 *   desY: number,      // The y-coordinate where the image should be drawn on the canvas.
 *   desWidth: number,  // The computed width of the image on the canvas.
 *   desHeight: number  // The computed height of the image on the canvas.
 * }} Object containing calculated destination coordinates and dimensions.
 *
 * @description
 * This function determines how an image should be drawn onto a canvas so that:
 * - The image maintains its original aspect ratio.
 * - It fits within the canvas entirely (no cropping).
 * - It is centered either horizontally or vertically, depending on orientation.
 *
 * The logic handles four scenarios:
 * 1. Both image and canvas are landscape.
 * 2. Both are portrait.
 * 3. Image is landscape, canvas is portrait.
 * 4. Image is portrait, canvas is landscape.
 *
 * Example usage:
 * ```js
 * const { desX, desY, desWidth, desHeight } = setupRenderPositionOnCanvas(img, canvas);
 * const ctx = canvas.getContext('2d');
 * ctx.drawImage(img, desX, desY, desWidth, desHeight);
 * ```
 */
export function setupRenderPositionOnCanvas(image, canvas) {
  let desX = 0;
  let desY = 0;
  let desWidth = 0;
  let desHeight = 0;

  const imgRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = canvas.width / canvas.height;

  const imgIsLandscape = imgRatio >= 1;
  const canvasIsLandscape = canvasRatio >= 1;

  // --- Orientation-based scaling ---
  if (imgIsLandscape && canvasIsLandscape) {
    // Both are landscape
    if (imgRatio > canvasRatio) {
      // Image wider → fit width
      desWidth = canvas.width;
      desHeight = (canvas.width * image.naturalHeight) / image.naturalWidth;
      desY = (canvas.height - desHeight) / 2;

      return {
        desX,
        desY,
        desWidth,
        desHeight,
      };
    }

    // Image narrower -> fit height
    desHeight = canvas.height;
    desWidth = (canvas.height * image.naturalWidth) / image.naturalHeight;
    desX = (canvas.width - desWidth) / 2;

    return {
      desX,
      desY,
      desWidth,
      desHeight,
    };
  } else if (!imgIsLandscape && !canvasIsLandscape) {
    // Both are portrait
    if (imgRatio > canvasRatio) {
      // Image relatively wider → fit width
      desWidth = canvas.width;
      desHeight = image.naturalHeight * (canvas.width / image.naturalWidth);
      desY = (canvas.height - desHeight) / 2;

      return {
        desX,
        desY,
        desWidth,
        desHeight,
      };
    }
    // Image relatively taller → fit height
    desHeight = canvas.height;
    desWidth = image.naturalWidth * (canvas.height / image.naturalHeight);
    desX = (canvas.width - desWidth) / 2;

    return {
      desX,
      desY,
      desWidth,
      desHeight,
    };
  } else if (imgIsLandscape && !canvasIsLandscape) {
    // Image landscape, canvas portrait → fit width
    desWidth = canvas.width;
    desHeight = image.naturalHeight * (canvas.width / image.naturalWidth);
    desY = -(desHeight - canvas.height) / 2;

    return {
      desX,
      desY,
      desWidth,
      desHeight,
    };
  }
  // Image portrait, canvas landscape → fit height
  desHeight = canvas.height;
  desWidth = image.naturalWidth * (canvas.height / image.naturalHeight);
  desX = -(desWidth - canvas.width) / 2;

  return {
    desX,
    desY,
    desWidth,
    desHeight,
  };
}
