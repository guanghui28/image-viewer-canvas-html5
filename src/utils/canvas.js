/**
 * Calculates the destination position and size at which an image should be rendered
 * on a given canvas so that it maintains its aspect ratio and fits appropriately
 * within the canvas boundaries. The function considers both image and canvas
 * orientation (landscape/portrait) to determine whether to fit by width or height.
 *
 * @function getInitialDestinationInfo
 * @param {HTMLImageElement} image - The image object (must have `naturalWidth` and `naturalHeight` defined).
 * @param {HTMLCanvasElement} canvas - The target canvas on which the image will be rendered.
 * @returns {{
 *   desX: number,      // The x-coordinate where the image should be drawn on the canvas.
 *   desY: number,      // The y-coordinate where the image should be drawn on the canvas.
 *   desW: number,  // The computed width of the image on the canvas.
 *   desH: number  // The computed height of the image on the canvas.
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
 * const { desX, desY, desW, desH } = getInitialDestinationInfo(img, canvas);
 * const ctx = canvas.getContext('2d');
 * ctx.drawImage(img, desX, desY, desW, desH);
 * ```
 */
export function getInitialDestinationInfo(image, canvas) {
  let desX = 0;
  let desY = 0;
  let desW = 0;
  let desH = 0;

  const imgRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = canvas.width / canvas.height;

  const imgIsLandscape = imgRatio >= 1;
  const canvasIsLandscape = canvasRatio >= 1;

  // --- Orientation-based scaling ---
  if (imgIsLandscape && canvasIsLandscape) {
    // Both are landscape
    if (imgRatio > canvasRatio) {
      // Image wider → fit width
      desW = canvas.width;
      desH = (canvas.width * image.naturalHeight) / image.naturalWidth;
      desY = (canvas.height - desH) / 2;

      return {
        desX,
        desY,
        desW,
        desH,
      };
    }

    // Image narrower -> fit height
    desH = canvas.height;
    desW = (canvas.height * image.naturalWidth) / image.naturalHeight;
    desX = (canvas.width - desW) / 2;

    return {
      desX,
      desY,
      desW,
      desH,
    };
  } else if (!imgIsLandscape && !canvasIsLandscape) {
    // Both are portrait
    if (imgRatio > canvasRatio) {
      // Image relatively wider → fit width
      desW = canvas.width;
      desH = image.naturalHeight * (canvas.width / image.naturalWidth);
      desY = (canvas.height - desH) / 2;

      return {
        desX,
        desY,
        desW,
        desH,
      };
    }
    // Image relatively taller → fit height
    desH = canvas.height;
    desW = image.naturalWidth * (canvas.height / image.naturalHeight);
    desX = (canvas.width - desW) / 2;

    return {
      desX,
      desY,
      desW,
      desH,
    };
  } else if (imgIsLandscape && !canvasIsLandscape) {
    // Image landscape, canvas portrait → fit width
    desW = canvas.width;
    desH = image.naturalHeight * (canvas.width / image.naturalWidth);
    desY = -(desH - canvas.height) / 2;

    return {
      desX,
      desY,
      desW,
      desH,
    };
  }
  // Image portrait, canvas landscape → fit height
  desH = canvas.height;
  desW = image.naturalWidth * (canvas.height / image.naturalHeight);
  desX = -(desW - canvas.width) / 2;

  return {
    desX,
    desY,
    desW,
    desH,
  };
}

/**
 * Draws a circular point on a 2D canvas context.
 *
 * @function drawPoint
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context to draw on.
 * @param {Object} options - Configuration options for the point.
 * @param {number} options.x - The x-coordinate of the point center.
 * @param {number} options.y - The y-coordinate of the point center.
 * @param {number} options.radius - The radius of the point.
 * @param {string} [options.strokeColor="red"] - The stroke color of the point’s outline.
 * @param {string} [options.color="rgba(255, 0, 0, 0.3)"] - The fill color of the point.
 * @param {number} [options.lineWidth=1] - The width of the outline stroke.
 *
 * @example
 * drawPoint(ctx, {
 *   x: 50,
 *   y: 75,
 *   radius: 5,
 *   strokeColor: "#ff0000",
 *   color: "rgba(255, 0, 0, 0.2)",
 *   lineWidth: 2
 * });
 */
export function drawPoint(
  ctx,
  {
    x,
    y,
    radius,
    strokeColor = "red",
    color = "rgba(255, 0, 0, 0.3)",
    lineWidth = 1,
  }
) {
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), radius, 0, Math.PI * 2);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draws a grid on a canvas element by dividing it into the specified number of rows and columns.
 *
 * @function drawGrid
 * @param {Object} options - Configuration options for the grid.
 * @param {CanvasRenderingContext2D} options.ctx - The canvas 2D rendering context to draw on.
 * @param {number} options.rows - The number of horizontal grid lines (rows).
 * @param {number} options.cols - The number of vertical grid lines (columns).
 * @param {string} options.strokeColor - The color of the grid lines.
 * @param {number} [options.lineWidth=1] - The width of the grid lines.
 *
 * @example
 * drawGrid({
 *   ctx,
 *   rows: 10,
 *   cols: 10,
 *   strokeColor: "#ccc",
 *   lineWidth: 1
 * });
 */
export function drawGrid({ ctx, rows, cols, strokeColor, lineWidth = 1 }) {
  const canvas = ctx.canvas;
  const rowGap = canvas.height / rows;
  const colGap = canvas.width / cols;

  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeColor;

  for (let i = 0; i <= rows; i++) {
    ctx.moveTo(0, i * rowGap);
    ctx.lineTo(canvas.width, i * rowGap);
  }

  for (let i = 0; i <= cols; i++) {
    ctx.moveTo(i * colGap, 0);
    ctx.lineTo(i * colGap, canvas.height);
  }

  ctx.stroke();
  ctx.restore();
}
