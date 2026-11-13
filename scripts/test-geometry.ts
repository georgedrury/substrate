// Checks the canvas geometry in registry/substrate/lib/math.ts, chiefly that
// resizing a rotated box keeps the opposite handle fixed and puts the dragged
// corner under the pointer. Run with: npm run test:geometry
import {
	HANDLES,
	angleBetween,
	handlePosition,
	normalizeAngle,
	resizeBounds,
	rotatedBounds,
	snapAngle,
} from "../registry/substrate/lib/math"
import type { HandlePosition } from "../registry/substrate/types"

const OPPOSITE: Record<HandlePosition, HandlePosition> = {
	nw: "se", n: "s", ne: "sw", e: "w", se: "nw", s: "n", sw: "ne", w: "e",
}

// A fixed seed keeps a failure reproducible
let seed = 12345
function random(low: number, high: number): number {
	seed = (seed * 1664525 + 1013904223) % 4294967296
	return low + (seed / 4294967296) * (high - low)
}

const EPSILON = 1e-6
let checks = 0
const failures: string[] = []

function expect(ok: boolean, message: string) {
	checks++
	if (!ok) failures.push(message)
}

const near = (a: number, b: number) => Math.abs(a - b) < EPSILON

for (let i = 0; i < 2000; i++) {
	const start = { x: random(-200, 200), y: random(-200, 200), width: random(40, 300), height: random(40, 300) }
	const rotation = random(-180, 180)
	const handle = HANDLES[i % HANDLES.length]
	// Small enough that the box never collapses
	const delta = { x: random(-15, 15), y: random(-15, 15) }

	const dragged = handlePosition(handle, start, rotation)
	const anchorBefore = handlePosition(OPPOSITE[handle], start, rotation)
	const next = resizeBounds(start, handle, delta, rotation)
	const anchorAfter = handlePosition(OPPOSITE[handle], next, rotation)

	expect(
		near(anchorBefore.x, anchorAfter.x) && near(anchorBefore.y, anchorAfter.y),
		`${handle} at ${rotation.toFixed(1)}°: the opposite handle moved`,
	)

	if (handle.length === 2) {
		const after = handlePosition(handle, next, rotation)
		expect(
			near(after.x, dragged.x + delta.x) && near(after.y, dragged.y + delta.y),
			`${handle} at ${rotation.toFixed(1)}°: the corner is not under the pointer`,
		)
	}
}

// Large drags squash the box to the minimum size, and the far handle still holds
for (let i = 0; i < 1000; i++) {
	const start = { x: random(-100, 100), y: random(-100, 100), width: random(40, 200), height: random(40, 200) }
	const rotation = random(-180, 180)
	const handle = HANDLES[i % HANDLES.length]
	const delta = { x: random(-600, 600), y: random(-600, 600) }
	const anchorBefore = handlePosition(OPPOSITE[handle], start, rotation)
	const next = resizeBounds(start, handle, delta, rotation)
	const anchorAfter = handlePosition(OPPOSITE[handle], next, rotation)
	expect(next.width >= 1 && next.height >= 1, `${handle}: collapsed below 1`)
	expect(
		near(anchorBefore.x, anchorAfter.x) && near(anchorBefore.y, anchorAfter.y),
		`${handle} at ${rotation.toFixed(1)}°: the opposite handle moved on a large drag`,
	)
}

// Unrotated resizing is plain arithmetic
const box = { x: 10, y: 20, width: 100, height: 50 }
expect(JSON.stringify(resizeBounds(box, "se", { x: 5, y: -10 }, 0)) === JSON.stringify({ x: 10, y: 20, width: 105, height: 40 }), "se, unrotated")
expect(JSON.stringify(resizeBounds(box, "nw", { x: 5, y: 5 }, 0)) === JSON.stringify({ x: 15, y: 25, width: 95, height: 45 }), "nw, unrotated")

// Dragging past the far edge stops at 1 unit and keeps the far edge in place
const squashedFromRight = resizeBounds(box, "w", { x: 500, y: 0 }, 0)
expect(squashedFromRight.width === 1 && near(squashedFromRight.x + squashedFromRight.width, 110), "clamp keeps the right edge")
const squashedFromLeft = resizeBounds(box, "e", { x: -500, y: 0 }, 0)
expect(squashedFromLeft.width === 1 && near(squashedFromLeft.x, 10), "clamp keeps the left edge")

// Angles
expect(normalizeAngle(190) === -170 && normalizeAngle(-190) === 170 && normalizeAngle(180) === -180 && normalizeAngle(360) === 0, "normalizeAngle")
expect(snapAngle(37) === 30 && snapAngle(38) === 45, "snapAngle")
expect(near(angleBetween({ x: 0, y: 0 }, { x: 0, y: 1 }), 90), "angleBetween points down at 90°")

// A wide box turned a quarter lands tall, about the same centre
const turned = rotatedBounds({ x: 0, y: 0, width: 100, height: 20 }, 90)
expect(near(turned.width, 20) && near(turned.height, 100) && near(turned.x, 40) && near(turned.y, -40), "rotatedBounds")

if (failures.length > 0) {
	console.error(`${failures.length} of ${checks} checks failed`)
	for (const failure of failures.slice(0, 10)) console.error(`  ${failure}`)
	process.exit(1)
}
console.log(`Geometry: ${checks} checks passed`)
