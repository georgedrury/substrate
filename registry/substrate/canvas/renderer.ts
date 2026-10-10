import type {
	DesignElement,
	RectangleElement,
	EllipseElement,
	TextElement,
	LineElement,
	FrameElement,
	Camera,
	Bounds,
	Point,
	ToolType,
} from "@/lib/substrate/types"

// ── Grid ──

export function renderGrid(
	ctx: CanvasRenderingContext2D,
	camera: Camera,
	width: number,
	height: number,
	color?: string,
) {
	const gridSize = 20
	const dotSize = 1

	const startX = Math.floor(-camera.x / camera.zoom / gridSize) * gridSize
	const startY = Math.floor(-camera.y / camera.zoom / gridSize) * gridSize
	const endX =
		startX + Math.ceil(width / camera.zoom / gridSize) * gridSize + gridSize
	const endY =
		startY + Math.ceil(height / camera.zoom / gridSize) * gridSize + gridSize

	ctx.fillStyle = color || "oklch(0.75 0 0)"

	for (let x = startX; x <= endX; x += gridSize) {
		for (let y = startY; y <= endY; y += gridSize) {
			ctx.beginPath()
			ctx.arc(x, y, dotSize / camera.zoom, 0, Math.PI * 2)
			ctx.fill()
		}
	}
}

// ── Element Rendering ──

function applyElementTransform(
	ctx: CanvasRenderingContext2D,
	el: DesignElement,
) {
	if (el.rotation !== 0) {
		const cx = el.x + el.width / 2
		const cy = el.y + el.height / 2
		ctx.translate(cx, cy)
		ctx.rotate((el.rotation * Math.PI) / 180)
		ctx.translate(-cx, -cy)
	}
	if (el.opacity < 1) {
		ctx.globalAlpha = el.opacity
	}
}

function applyFill(ctx: CanvasRenderingContext2D, el: DesignElement) {
	if (el.fill) {
		ctx.fillStyle = el.fill.color
		if (el.fill.opacity < 1) {
			ctx.globalAlpha = (el.opacity ?? 1) * el.fill.opacity
		}
	}
}

function applyStroke(ctx: CanvasRenderingContext2D, el: DesignElement) {
	if (el.stroke) {
		ctx.strokeStyle = el.stroke.color
		ctx.lineWidth = el.stroke.width
		if (el.stroke.opacity < 1) {
			ctx.globalAlpha = (el.opacity ?? 1) * el.stroke.opacity
		}
	}
}

function renderRectangle(ctx: CanvasRenderingContext2D, el: RectangleElement) {
	const r = Math.min(el.cornerRadius, el.width / 2, el.height / 2)

	if (r > 0) {
		ctx.beginPath()
		ctx.roundRect(el.x, el.y, el.width, el.height, r)
		if (el.fill) {
			applyFill(ctx, el)
			ctx.fill()
		}
		if (el.stroke) {
			applyStroke(ctx, el)
			ctx.stroke()
		}
	} else {
		if (el.fill) {
			applyFill(ctx, el)
			ctx.fillRect(el.x, el.y, el.width, el.height)
		}
		if (el.stroke) {
			applyStroke(ctx, el)
			ctx.strokeRect(el.x, el.y, el.width, el.height)
		}
	}
}

function renderEllipse(ctx: CanvasRenderingContext2D, el: EllipseElement) {
	const cx = el.x + el.width / 2
	const cy = el.y + el.height / 2
	ctx.beginPath()
	ctx.ellipse(cx, cy, el.width / 2, el.height / 2, 0, 0, Math.PI * 2)
	if (el.fill) {
		applyFill(ctx, el)
		ctx.fill()
	}
	if (el.stroke) {
		applyStroke(ctx, el)
		ctx.stroke()
	}
}

function renderText(ctx: CanvasRenderingContext2D, el: TextElement) {
	const { textStyle } = el
	ctx.font = `${textStyle.fontWeight} ${textStyle.fontSize}px ${textStyle.fontFamily}`
	ctx.textAlign = textStyle.textAlign
	ctx.textBaseline = "top"

	if (el.fill) {
		applyFill(ctx, el)
	} else {
		ctx.fillStyle = "oklch(0.6 0 0)"
	}

	const lineHeight = textStyle.fontSize * textStyle.lineHeight
	const lines = textStyle.content.split("\n")

	let textX = el.x
	if (textStyle.textAlign === "center") textX = el.x + el.width / 2
	else if (textStyle.textAlign === "right") textX = el.x + el.width

	for (let i = 0; i < lines.length; i++) {
		ctx.fillText(lines[i], textX, el.y + i * lineHeight)
	}
}

function renderLine(ctx: CanvasRenderingContext2D, el: LineElement) {
	ctx.beginPath()
	ctx.moveTo(el.x, el.y)
	ctx.lineTo(el.x + el.width, el.y + el.height)

	if (el.stroke) {
		applyStroke(ctx, el)
	} else {
		ctx.strokeStyle = "oklch(0.6 0 0)"
		ctx.lineWidth = 2
	}
	ctx.stroke()
}

function renderFrame(ctx: CanvasRenderingContext2D, el: FrameElement) {
	const r = Math.min(el.cornerRadius, el.width / 2, el.height / 2)

	// Frame label
	ctx.font = "11px sans-serif"
	ctx.fillStyle = "oklch(0.556 0 0)"
	ctx.textAlign = "left"
	ctx.textBaseline = "bottom"
	ctx.fillText(el.name, el.x, el.y - 4)

	// Frame body
	if (r > 0) {
		ctx.beginPath()
		ctx.roundRect(el.x, el.y, el.width, el.height, r)
		if (el.fill) {
			applyFill(ctx, el)
			ctx.fill()
		}
		if (el.stroke) {
			applyStroke(ctx, el)
			ctx.stroke()
		}
	} else {
		if (el.fill) {
			applyFill(ctx, el)
			ctx.fillRect(el.x, el.y, el.width, el.height)
		}
		if (el.stroke) {
			applyStroke(ctx, el)
			ctx.stroke()
		}
	}
}

export function renderElement(
	ctx: CanvasRenderingContext2D,
	el: DesignElement,
) {
	if (!el.visible) return

	ctx.save()
	applyElementTransform(ctx, el)

	switch (el.type) {
		case "rectangle":
			renderRectangle(ctx, el)
			break
		case "ellipse":
			renderEllipse(ctx, el)
			break
		case "text":
			renderText(ctx, el)
			break
		case "line":
			renderLine(ctx, el)
			break
		case "frame":
			renderFrame(ctx, el)
			break
	}

	ctx.restore()
}

// ── Selection UI (drawn in screen space) ──

export function renderSelectionBox(
	ctx: CanvasRenderingContext2D,
	bounds: Bounds,
	_zoom: number,
) {
	ctx.strokeStyle = "oklch(0.6 0.2 250)"
	ctx.lineWidth = 1.5
	ctx.setLineDash([])
	ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
}

const HANDLE_SIZE = 8

export function renderResizeHandles(
	ctx: CanvasRenderingContext2D,
	bounds: Bounds,
	_zoom: number,
) {
	const half = HANDLE_SIZE / 2
	const positions = [
		{ x: bounds.x, y: bounds.y }, // nw
		{ x: bounds.x + bounds.width / 2, y: bounds.y }, // n
		{ x: bounds.x + bounds.width, y: bounds.y }, // ne
		{ x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }, // e
		{ x: bounds.x + bounds.width, y: bounds.y + bounds.height }, // se
		{ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height }, // s
		{ x: bounds.x, y: bounds.y + bounds.height }, // sw
		{ x: bounds.x, y: bounds.y + bounds.height / 2 }, // w
	]

	ctx.fillStyle = "white"
	ctx.strokeStyle = "oklch(0.6 0.2 250)"
	ctx.lineWidth = 1.5

	for (const pos of positions) {
		ctx.fillRect(pos.x - half, pos.y - half, HANDLE_SIZE, HANDLE_SIZE)
		ctx.strokeRect(pos.x - half, pos.y - half, HANDLE_SIZE, HANDLE_SIZE)
	}
}

// ── Creation Preview ──

export function renderCreationPreview(
	ctx: CanvasRenderingContext2D,
	toolType: ToolType,
	start: Point,
	end: Point,
) {
	const x = Math.min(start.x, end.x)
	const y = Math.min(start.y, end.y)
	const w = Math.abs(end.x - start.x)
	const h = Math.abs(end.y - start.y)

	ctx.save()
	ctx.strokeStyle = "oklch(0.6 0.2 250)"
	ctx.lineWidth = 1
	ctx.setLineDash([4, 4])
	ctx.fillStyle = "oklch(0.6 0.2 250 / 0.1)"

	switch (toolType) {
		case "rectangle":
		case "frame":
		case "text":
			ctx.fillRect(x, y, w, h)
			ctx.strokeRect(x, y, w, h)
			break
		case "ellipse": {
			const cx = x + w / 2
			const cy = y + h / 2
			ctx.beginPath()
			ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2)
			ctx.fill()
			ctx.stroke()
			break
		}
		case "line":
			ctx.beginPath()
			ctx.moveTo(start.x, start.y)
			ctx.lineTo(end.x, end.y)
			ctx.stroke()
			break
	}

	ctx.restore()
}

// ── Marquee Selection ──

export function renderMarquee(ctx: CanvasRenderingContext2D, bounds: Bounds) {
	ctx.save()
	ctx.fillStyle = "oklch(0.6 0.2 250 / 0.08)"
	ctx.strokeStyle = "oklch(0.6 0.2 250)"
	ctx.lineWidth = 1
	ctx.setLineDash([4, 4])
	ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height)
	ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
	ctx.restore()
}
