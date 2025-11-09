import "./style.css";
import { drawGrid, drawPoint, getInitialDestinationInfo } from "./utils/canvas";
import { getDistance, isPointInsideArea, isRectInside } from "./utils/math";

/**
 * DOM ELEMENTS
 */
const imgEl = document.querySelector("#imgEl");
const canvas = document.querySelector("#main-canvas");
const ctx = canvas.getContext("2d");
const formSizeEl = document.querySelector("#select-size-form");
const imgSelectEl = document.querySelector("#picture-orientation");
const debugModeEl = document.querySelector("#debug-mode");
const metricEl = document.querySelector("#metric");
const destinationPointText = metricEl.querySelector("#destination-point");
const imageWidthText = metricEl.querySelector("#image-width");
const imageHeightText = metricEl.querySelector("#image-height");
const imageScaleText = metricEl.querySelector("#image-scale");

/**
 * CONSTANTS
 */
const ROWS = 3;
const COLS = 3;
const MAX_SCALE = 10;
const MIN_SCALE = 0.5;
const DEBUG_MODE = {
  ON: "on",
  OFF: "off",
};
const ORIENTATION = {
  LANDSCAPE: "landscape",
  PORTRAIT: "portrait",
};
let initialDestinationInfo = {
  desX: 0,
  desY: 0,
  desW: 0,
  desH: 0,
};

/**
 * STATES
 */
let animationID = 0;
let isPinching = false;
let isPanning = false;
let startDistance = 0;
let scale = 1;
let baseScale = 1;
let desWidth = 0;
let desHeight = 0;
let pinchMidPoint = null;
let isDebug = false;

/**
 * The destination coordinate to start render image to canvas
 */
const desPos = { x: 0, y: 0 };
/**
 * starting position when the first finger take action
 */
const startPos = { x: 0, y: 0 };
/**
 * The gap vector between starting position to destinate position
 */
const diff = { x: 0, y: 0 };

/**
 * rounded number good for drawing perfomances
 */
const drawInfo = {
  x: Math.round(desPos.x),
  y: Math.round(desPos.y),
  width: Math.round(desWidth * scale),
  height: Math.round(desHeight * scale),
};

function resetAppState() {
  isPinching = false;
  isPanning = false;
  startDistance = 0;
  scale = 1;
  baseScale = 1;
}

function getImageSource(orientation) {
  return orientation === ORIENTATION.LANDSCAPE
    ? "./nature-landscape.png"
    : "./nature-portrait.png";
}

function draw() {
  ctx.drawImage(
    imgEl,
    0,
    0,
    imgEl.naturalWidth,
    imgEl.naturalHeight,
    drawInfo.x,
    drawInfo.y,
    drawInfo.width,
    drawInfo.height
  );

  drawGrid({
    ctx,
    cols: COLS,
    rows: ROWS,
    strokeColor: "#1c1c1c",
  });
}

function drawDebug() {
  if (isPinching && pinchMidPoint) {
    drawPoint(ctx, {
      x: pinchMidPoint.x,
      y: pinchMidPoint.y,
      radius: 10 * scale,
      strokeColor: "red",
      color: "rgba(255, 0, 0, 0.3)",
    });
  }

  drawPoint(ctx, {
    x: desPos.x,
    y: desPos.y,
    radius: 5,
  });
}

function getSizeFromUserInput(formEle) {
  const formData = new FormData(formEle);
  const width = Number(formData.get("canvas-width"));
  const height = Number(formData.get("canvas-height"));

  return { width, height };
}

function stopAnimation(id) {
  window.cancelAnimationFrame(id);
}

function updateMetricBoard() {
  destinationPointText.textContent = `x: ${drawInfo.x}, y: ${drawInfo.y}`;
  imageWidthText.textContent = `Width: ${drawInfo.width}`;
  imageHeightText.textContent = `Height: ${drawInfo.height}`;
  imageScaleText.textContent = `${scale.toFixed(6)}`;
}

function updateDrawInfo() {
  drawInfo.x = Math.round(desPos.x);
  drawInfo.y = Math.round(desPos.y);
  drawInfo.width = Math.round(desWidth * scale);
  drawInfo.height = Math.round(desHeight * scale);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateDrawInfo();

  draw();

  if (isDebug) {
    drawDebug();
    updateMetricBoard();
  }

  animationID = window.requestAnimationFrame(animate);
}

function startAnimation(cavasWidth, canvasHeight) {
  stopAnimation(animationID);

  canvas.width = cavasWidth;
  canvas.height = canvasHeight;

  initialDestinationInfo = getInitialDestinationInfo(imgEl, canvas);
  desPos.x = initialDestinationInfo.desX;
  desPos.y = initialDestinationInfo.desY;
  desWidth = initialDestinationInfo.desW;
  desHeight = initialDestinationInfo.desH;

  animate();
}

function setMetricBoardVisibility(isDebug) {
  if (isDebug) {
    metricEl.classList.add("show");
  } else {
    metricEl.classList.remove("show");
  }
}

const attachFormSizeEventListeners = () => {
  formSizeEl.addEventListener("submit", (e) => {
    e.preventDefault();

    const { width, height } = getSizeFromUserInput(e.target);

    if (document.activeElement) {
      document.activeElement.blur();
    }

    if (!width || !height) {
      e.target.reset();
      return;
    }

    startAnimation(width, height);
  });
};

const attachCanvasEventListeners = () => {
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      isPanning = true;
      isPinching = false;
      const canvasDOMRect = canvas.getBoundingClientRect();
      startPos.x = e.touches[0].clientX - canvasDOMRect.x;
      startPos.y = e.touches[0].clientY - canvasDOMRect.y;
      diff.x = startPos.x - desPos.x;
      diff.y = startPos.y - desPos.y;
    } else if (e.touches.length === 2) {
      isPinching = true;
      isPanning = false;
      startDistance = getDistance(
        { x: e.touches[0].clientX, y: e.touches[0].clientY },
        { x: e.touches[1].clientX, y: e.touches[1].clientY }
      );
      baseScale = scale;
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const canvasDOMRect = canvas.getBoundingClientRect();
    const imageRect = {
      x: desPos.x,
      y: desPos.y,
      width: desWidth * scale,
      height: desHeight * scale,
    };

    if (isPanning) {
      const canvasRect = {
        x: 0,
        y: 0,
        width: canvasDOMRect.width,
        height: canvasDOMRect.height,
      };

      startPos.x = e.touches[0].clientX - canvasDOMRect.x;
      startPos.y = e.touches[0].clientY - canvasDOMRect.y;
      const point = { x: startPos.x, y: startPos.y };

      if (!isPointInsideArea(startPos, canvasRect)) return;

      if (isPointInsideArea(point, imageRect)) {
        desPos.x = startPos.x - diff.x;
        desPos.y = startPos.y - diff.y;
        return;
      }

      diff.x = startPos.x - desPos.x;
      diff.y = startPos.y - desPos.y;
    }

    if (isPinching) {
      const currentDistance = getDistance(
        { x: e.touches[0].clientX, y: e.touches[0].clientY },
        { x: e.touches[1].clientX, y: e.touches[1].clientY }
      );

      // Find the pinchMidPoint of the two fingers in canvas coordinates
      pinchMidPoint = {
        x:
          (e.touches[0].clientX + e.touches[1].clientX) / 2 -
          canvasDOMRect.left,
        y:
          (e.touches[0].clientY + e.touches[1].clientY) / 2 - canvasDOMRect.top,
      };
      const imageRect = {
        x: desPos.x,
        y: desPos.y,
        width: desWidth * scale,
        height: desHeight * scale,
      };

      if (!isPointInsideArea(pinchMidPoint, imageRect)) return;

      const prevScale = scale;
      const pinchScale = currentDistance / startDistance;
      const newScale = baseScale * pinchScale;
      scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      const scaleFactor = scale / prevScale;
      desPos.x = pinchMidPoint.x - (pinchMidPoint.x - desPos.x) * scaleFactor;
      desPos.y = pinchMidPoint.y - (pinchMidPoint.y - desPos.y) * scaleFactor;
    }
  });

  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();

    const canvasRect = {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    };
    const imageRect = {
      x: desPos.x,
      y: desPos.y,
      width: desWidth * scale,
      height: desHeight * scale,
    };

    if (!isRectInside(canvasRect, imageRect)) {
      initialDestinationInfo = getInitialDestinationInfo(imgEl, canvas);
      desPos.x = initialDestinationInfo.desX;
      desPos.y = initialDestinationInfo.desY;
      desWidth = initialDestinationInfo.desW;
      desHeight = initialDestinationInfo.desH;

      scale = 1;
      baseScale = 1;
    }

    isPanning = false;
    isPinching = false;
    startDistance = 0;
  });
};

const attachAppEventListeners = () => {
  attachFormSizeEventListeners();
  attachCanvasEventListeners();

  imgSelectEl.addEventListener("change", (e) => {
    imgEl.src = getImageSource(e.target.value);
    resetAppState();
  });

  debugModeEl.addEventListener("change", (e) => {
    isDebug = e.target.value === DEBUG_MODE.ON;
    setMetricBoardVisibility(isDebug);
  });

  imgEl.addEventListener("load", () => {
    const { width, height } = getSizeFromUserInput(formSizeEl);
    startAnimation(width, height);
  });
};

const main = () => {
  attachAppEventListeners();
  imgEl.src = getImageSource(imgSelectEl.value);
  isDebug = debugModeEl.value === DEBUG_MODE.ON;
  setMetricBoardVisibility(isDebug);
};

main();
