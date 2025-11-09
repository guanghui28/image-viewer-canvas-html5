export function getDistance(pointA, pointB) {
  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
}

export function isPointInsideArea(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Checks whether rectangleA is completely inside rectangleB.
 *
 * @param {Object} rectangleA - The inner rectangle.
 * @param {number} rectangleA.x - The x-coordinate of the top-left corner of A.
 * @param {number} rectangleA.y - The y-coordinate of the top-left corner of A.
 * @param {number} rectangleA.width - The width of A.
 * @param {number} rectangleA.height - The height of A.
 * @param {Object} rectangleB - The outer rectangle.
 * @param {number} rectangleB.x - The x-coordinate of the top-left corner of B.
 * @param {number} rectangleB.y - The y-coordinate of the top-left corner of B.
 * @param {number} rectangleB.width - The width of B.
 * @param {number} rectangleB.height - The height of B.
 * @returns {boolean} True if A is fully inside B, otherwise false.
 *
 * @example
 * const rectA = { x: 30, y: 30, width: 50, height: 50 };
 * const rectB = { x: 0, y: 0, width: 200, height: 200 };
 * console.log(isRectInside(rectA, rectB)); // true
 */
export function isRectInside(rectangleA, rectangleB) {
  const aLeft = rectangleA.x;
  const aRight = rectangleA.x + rectangleA.width;
  const aTop = rectangleA.y;
  const aBottom = rectangleA.y + rectangleA.height;

  const bLeft = rectangleB.x;
  const bRight = rectangleB.x + rectangleB.width;
  const bTop = rectangleB.y;
  const bBottom = rectangleB.y + rectangleB.height;

  return (
    aLeft >= bLeft && aRight <= bRight && aTop >= bTop && aBottom <= bBottom
  );
}
