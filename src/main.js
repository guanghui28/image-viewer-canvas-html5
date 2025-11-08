import "./style.css";

const imgEl = document.querySelector("#imgEl");
const canvas = document.querySelector("#main-canvas");
const ctx = canvas.getContext("2d");
const formSizeEl = document.querySelector("#select-size-form");
const imgSelectEl = document.querySelector("#picture-orientation");
const ROWS = 3;
const COLS = 3;
const SCALE_MOVING_FACTOR = 40;
const MAX_SCALE = 10;
const MIN_SCALE = 0.5;

function getDistance(pointA, pointB) {
  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
}

function isPointInsideArea(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function getImageSource(orientation) {
  return orientation === "landscape"
    ? "./nature-landscape.png"
    : "./nature-portrait.png";
}

// state
let animationID = 0;
let isPinching = false;
let isPanning = false;
let startDistance = 0;
let scale = 1;
let baseScale = 1;
let desWidth = 0;
let desHeight = 0;
let pinchMidPoint = null;

const desPos = { x: 0, y: 0 };
const offsetPos = { x: 0, y: 0 };
const gapPos = { x: 0, y: 0 };

function setupRenderPositionOnCanvas() {
  desPos.x = 0;
  desPos.y = 0;

  const imgRatio = imgEl.naturalWidth / imgEl.naturalHeight;
  const canvasRatio = canvas.width / canvas.height;

  const imgIsLandscape = imgRatio >= 1;
  const canvasIsLandscape = canvasRatio >= 1;

  // --- Orientation-based scaling ---
  if (imgIsLandscape && canvasIsLandscape) {
    // Both are landscape
    if (imgRatio > canvasRatio) {
      // Image wider → fit width
      desWidth = canvas.width;
      desHeight = (canvas.width * imgEl.naturalHeight) / imgEl.naturalWidth;
      desPos.y = (canvas.height - desHeight) / 2;
    } else {
      // Image narrower -> fit height
      desHeight = canvas.height;
      desWidth = (canvas.height * imgEl.naturalWidth) / imgEl.naturalHeight;
      desPos.x = (canvas.width - desWidth) / 2;
    }
  } else if (!imgIsLandscape && !canvasIsLandscape) {
    // Both are portrait
    if (imgRatio > canvasRatio) {
      // Image relatively wider → fit width
      desWidth = canvas.width;
      desHeight = imgEl.naturalHeight * (canvas.width / imgEl.naturalWidth);
      desPos.y = (canvas.height - desHeight) / 2;
    } else {
      // Image relatively taller → fit height
      desHeight = canvas.height;
      desWidth = imgEl.naturalWidth * (canvas.height / imgEl.naturalHeight);
      desPos.x = (canvas.width - desWidth) / 2;
    }
  } else if (imgIsLandscape && !canvasIsLandscape) {
    // Image landscape, canvas portrait → fit width
    desWidth = canvas.width;
    desHeight = imgEl.naturalHeight * (canvas.width / imgEl.naturalWidth);
    desPos.y = -(desHeight - canvas.height) / 2;
  } else {
    // Image portrait, canvas landscape → fit height
    desHeight = canvas.height;
    desWidth = imgEl.naturalWidth * (canvas.height / imgEl.naturalHeight);
    desPos.x = -(desWidth - canvas.width) / 2;
  }
}

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();

  if (e.touches.length === 1) {
    isPanning = true;
    isPinching = false;
    const canvasDOMRect = canvas.getBoundingClientRect();
    offsetPos.x = e.touches[0].clientX - canvasDOMRect.x;
    offsetPos.y = e.touches[0].clientY - canvasDOMRect.y;
    gapPos.x = offsetPos.x - desPos.x;
    gapPos.y = offsetPos.y - desPos.y;
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

    offsetPos.x = e.touches[0].clientX - canvasDOMRect.x;
    offsetPos.y = e.touches[0].clientY - canvasDOMRect.y;
    const point = { x: offsetPos.x, y: offsetPos.y };

    if (!isPointInsideArea(point, canvasRect)) return;

    if (isPointInsideArea(point, imageRect)) {
      desPos.x = offsetPos.x - gapPos.x;
      desPos.y = offsetPos.y - gapPos.y;
      return;
    }

    gapPos.x = offsetPos.x - desPos.x;
    gapPos.y = offsetPos.y - desPos.y;
  }

  if (isPinching) {
    const currentDistance = getDistance(
      { x: e.touches[0].clientX, y: e.touches[0].clientY },
      { x: e.touches[1].clientX, y: e.touches[1].clientY }
    );

    // Find the pinchMidPoint of the two fingers in canvas coordinates
    pinchMidPoint = {
      x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - canvasDOMRect.left,
      y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - canvasDOMRect.top,
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
    const deltaScale = scale - prevScale;

    /**
     * each direction have the same scale factor
     * so the direction to scale down is base on vector 45 degree
     */
    const dir = { x: Math.cos(Math.PI / 4), y: Math.sin(Math.PI / 4) };

    desPos.x -= deltaScale * dir.x * SCALE_MOVING_FACTOR;
    desPos.y -= deltaScale * dir.y * SCALE_MOVING_FACTOR;
  }
});

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  console.log("touch end", e);
  isPanning = false;
  isPinching = false;
});

function draw() {
  const drawWidth = desWidth * scale;
  const drawHeight = desHeight * scale;
  ctx.drawImage(
    imgEl,
    0,
    0,
    imgEl.naturalWidth,
    imgEl.naturalHeight,
    desPos.x,
    desPos.y,
    drawWidth,
    drawHeight
  );

  if (isPinching && pinchMidPoint) {
    drawpinchMidPoint();
  }

  drawGrid();
}

function drawpinchMidPoint() {
  ctx.beginPath();
  ctx.arc(pinchMidPoint.x, pinchMidPoint.y, 10 * scale, 0, Math.PI * 2);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,0,0,0.3)";
  ctx.fill();
}

function getSizeFromUserInput(formEle) {
  const formData = new FormData(formEle);
  const width = Number(formData.get("canvas-width"));
  const height = Number(formData.get("canvas-height"));

  return { width, height };
}

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

imgSelectEl.addEventListener("change", (e) => {
  imgEl.src = getImageSource(e.target.value);
});

function drawGrid() {
  const rowGap = canvas.height / ROWS;
  const colGap = canvas.width / COLS;

  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#dfdfdf";

  for (let i = 0; i <= ROWS; i++) {
    ctx.moveTo(0, i * rowGap);
    ctx.lineTo(canvas.width, i * rowGap);
  }

  for (let i = 0; i <= COLS; i++) {
    ctx.moveTo(i * colGap, 0);
    ctx.lineTo(i * colGap, canvas.height);
  }

  ctx.stroke();
  ctx.restore();
}

function stopAnimation(id) {
  window.cancelAnimationFrame(id);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  draw();

  animationID = window.requestAnimationFrame(animate);
}

function startAnimation(width, height) {
  stopAnimation(animationID);
  canvas.width = width;
  canvas.height = height;
  setupRenderPositionOnCanvas();

  animate();
}

function main() {
  const { width, height } = getSizeFromUserInput(formSizeEl);
  startAnimation(width, height);
}

imgEl.src = getImageSource(imgSelectEl.value);

imgEl.addEventListener("load", () => {
  main();
});
