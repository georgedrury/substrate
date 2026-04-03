/**
 * Cubic Bezier easing utility library
 * Pure utility module with no React or client-side dependencies
 */

export interface CubicBezier {
  x1: number
  y1: number
  x2: number
  y2: number
}

export type EasingPresetName =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "ease-in-cubic"
  | "ease-out-cubic"
  | "ease-in-out-cubic"

/**
 * Standard easing curve presets
 */
export const EASING_PRESETS: Record<EasingPresetName, CubicBezier> = {
  linear: { x1: 0, y1: 0, x2: 1, y2: 1 },
  "ease-in": { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  "ease-out": { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  "ease-in-out": { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
  "ease-in-cubic": { x1: 0.32, y1: 0, x2: 0.67, y2: 0 },
  "ease-out-cubic": { x1: 0.33, y1: 1, x2: 0.68, y2: 1 },
  "ease-in-out-cubic": { x1: 0.65, y1: 0, x2: 0.35, y2: 1 },
}

/**
 * Evaluate a cubic bezier curve at parameter t using Newton's method
 * @param bezier - The cubic bezier curve definition
 * @param t - Parameter in [0, 1]
 * @returns The y value at parameter t
 */
export function evaluateCubicBezier(bezier: CubicBezier, t: number): number {
  const { x1, y1, x2, y2 } = bezier

  // Clamp t to valid range
  if (t <= 0) return 0
  if (t >= 1) return 1

  // Coefficients for cubic bezier: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
  // where P0=(0,0), P1=(x1,y1), P2=(x2,y2), P3=(1,1)

  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx

  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by

  // Find t value that corresponds to given x using Newton's method
  let x_t = t
  for (let i = 0; i < 8; i++) {
    // Derivative: dx/dt = 3ax*t² + 2bx*t + cx
    const derivative = 3 * ax * x_t * x_t + 2 * bx * x_t + cx
    if (Math.abs(derivative) < 1e-6) break

    // Current x value: ax*t³ + bx*t² + cx*t
    const x_current = ax * x_t * x_t * x_t + bx * x_t * x_t + cx * x_t
    x_t -= (x_current - t) / derivative
  }

  // Clamp to valid range
  x_t = Math.max(0, Math.min(1, x_t))

  // Evaluate y at the found t value
  const y = ay * x_t * x_t * x_t + by * x_t * x_t + cy * x_t
  return Math.max(0, Math.min(1, y))
}

/**
 * Convert a cubic bezier to CSS cubic-bezier() string
 * @param bezier - The cubic bezier curve
 * @returns CSS cubic-bezier string
 */
export function cubicBezierToString(bezier: CubicBezier): string {
  return `cubic-bezier(${bezier.x1}, ${bezier.y1}, ${bezier.x2}, ${bezier.y2})`
}

/**
 * Parse a CSS cubic-bezier() string to CubicBezier object
 * @param str - CSS cubic-bezier string
 * @returns CubicBezier object or null if invalid
 */
export function parseCubicBezier(str: string): CubicBezier | null {
  const match = str.match(/cubic-bezier\s*\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/)
  if (!match) return null

  const [, x1Str, y1Str, x2Str, y2Str] = match
  const x1 = parseFloat(x1Str)
  const y1 = parseFloat(y1Str)
  const x2 = parseFloat(x2Str)
  const y2 = parseFloat(y2Str)

  if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
    return null
  }

  return { x1, y1, x2, y2 }
}

/**
 * Check if two cubic bezier curves are equal
 * @param a - First curve
 * @param b - Second curve
 * @param tolerance - Floating point tolerance (default 0.0001)
 * @returns True if curves are equal within tolerance
 */
export function isCubicBezierEqual(
  a: CubicBezier,
  b: CubicBezier,
  tolerance: number = 0.0001
): boolean {
  return (
    Math.abs(a.x1 - b.x1) < tolerance &&
    Math.abs(a.y1 - b.y1) < tolerance &&
    Math.abs(a.x2 - b.x2) < tolerance &&
    Math.abs(a.y2 - b.y2) < tolerance
  )
}
