export function parseOklch(color: string): { l: number; c: number; h: number } | null {
  const match = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
  if (!match) return null
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  }
}

export function toOklch(l: number, c: number, h: number): string {
  return `oklch(${l} ${c} ${h})`
}

export function adjustLightness(color: string, delta: number): string {
  const parsed = parseOklch(color)
  if (!parsed) return color
  const l = Math.max(0, Math.min(1, parsed.l + delta))
  return toOklch(l, parsed.c, parsed.h)
}
