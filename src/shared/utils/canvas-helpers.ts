import type { Brush, Circle, Drawable, Line, Rect } from '@shared/types/canvas';

export const getBoundingBox = (obj: Drawable): { x: number; y: number; width: number; height: number } => {
	switch (obj.type) {
		case 'rect':
			return { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
		case 'circle':
			return { x: obj.cx - obj.r, y: obj.cy - obj.r, width: obj.r * 2, height: obj.r * 2 };
		case 'line': {
			const x1 = Math.min(obj.x1, obj.x2);
			const y1 = Math.min(obj.y1, obj.y2);
			const x2 = Math.max(obj.x1, obj.x2);
			const y2 = Math.max(obj.y1, obj.y2);
			return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
		}
		case 'text': {
			const fontSize = obj.fontSize;
			const lineHeight = fontSize * 1.2;
			const width = obj.width ?? obj.text.length * fontSize * 0.6;
			const height = obj.height ?? (obj.lines?.length || obj.text.split('\n').length) * lineHeight;
			return { x: obj.x, y: obj.y, width, height };
		}
		default:
			return { x: 0, y: 0, width: 0, height: 0 };
	}
};

export const isPointInBBox = (
	x: number,
	y: number,
	bbox: { x: number; y: number; width: number; height: number },
): boolean => {
	return x >= bbox.x && x <= bbox.x + bbox.width && y >= bbox.y && y <= bbox.y + bbox.height;
};

export const findObjectAtPoint = (objects: Drawable[], x: number, y: number): Drawable | null => {
	objects = objects.filter(obj => ['rect', 'circle', 'line', 'text'].includes(obj.type));
	for (let i = objects.length - 1; i >= 0; i--) {
		const obj = objects[i];
		const bbox = getBoundingBoxWithStroke(obj);
		if (isPointInBBox(x, y, bbox)) {
			return obj;
		}
	}
	return null;
};

export const getBoundingBoxWithStroke = (obj: Drawable): { x: number; y: number; width: number; height: number } => {
	const strokeWidth = getStrokeWidth(obj);

	const bbox = getBoundingBox(obj);

	return {
		x: bbox.x - strokeWidth / 2,
		y: bbox.y - strokeWidth / 2,
		width: bbox.width + strokeWidth,
		height: bbox.height + strokeWidth,
	};
};

const getStrokeWidth = (obj: Drawable): number => {
	switch (obj.type) {
		case 'rect':
			return (obj as Rect).strokeWidth || 0;
		case 'circle':
			return (obj as Circle).strokeWidth || 0;
		case 'line':
			return (obj as Line).strokeWidth || 0;
		default:
			return 0;
	}
};

export const normalizeRect = (x: number, y: number, width: number, height: number) => {
	let finalX = x;
	let finalY = y;
	let finalW = width;
	let finalH = height;

	if (width < 0) {
		finalX = x + width;
		finalW = -width;
	}
	if (height < 0) {
		finalY = y + height;
		finalH = -height;
	}

	return { x: finalX, y: finalY, width: finalW, height: finalH };
};

export const distanceFromPointToSegment = (
	px: number,
	py: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
): number => {
	const A = px - x1;
	const B = py - y1;
	const C = x2 - x1;
	const D = y2 - y1;

	const dot = A * C + B * D;
	const lenSq = C * C + D * D;
	let param = -1;
	if (lenSq !== 0) param = dot / lenSq;

	let xx, yy;
	if (param < 0) {
		xx = x1;
		yy = y1;
	} else if (param > 1) {
		xx = x2;
		yy = y2;
	} else {
		xx = x1 + param * C;
		yy = y1 + param * D;
	}

	const dx = px - xx;
	const dy = py - yy;
	return Math.sqrt(dx * dx + dy * dy);
};

export const findObjectAtPointPrecise = (
	objects: Drawable[],
	x: number,
	y: number,
	options: { tolerance?: number } = {},
): Drawable | null => {
	const { tolerance = 5 } = options;

	for (let i = objects.length - 1; i >= 0; i--) {
		const obj = objects[i];

		switch (obj.type) {
			case 'rect': {
				const r = obj as Rect;
				const strokeWidth = r.strokeWidth || 0;
				const effectiveTolerance = tolerance + strokeWidth / 2;

				if (
					x >= r.x - effectiveTolerance &&
					x <= r.x + r.width + effectiveTolerance &&
					y >= r.y - effectiveTolerance &&
					y <= r.y + r.height + effectiveTolerance
				) {
					return obj;
				}
				break;
			}

			case 'circle': {
				const c = obj as Circle;
				const strokeWidth = c.strokeWidth || 0;
				const effectiveTolerance = tolerance + strokeWidth / 2;
				const dx = x - c.cx;
				const dy = y - c.cy;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (dist <= c.r + effectiveTolerance) {
					return obj;
				}
				break;
			}

			case 'line': {
				const l = obj as Line;
				const strokeWidth = l.strokeWidth || 0;
				const effectiveTolerance = tolerance + strokeWidth / 2;
				const dist = distanceFromPointToSegment(x, y, l.x1, l.y1, l.x2, l.y2);

				if (dist <= effectiveTolerance) {
					return obj;
				}
				break;
			}

			case 'text': {
				const bbox = getBoundingBox(obj);
				if (x >= bbox.x && x <= bbox.x + bbox.width && y >= bbox.y && y <= bbox.y + bbox.height) {
					return obj;
				}
				break;
			}

			case 'brush': {
				const b = obj as Brush;
				const tol = b.strokeWidth / 2 + tolerance;
				for (const point of b.points) {
					const dx = x - point.x;
					const dy = y - point.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist <= tol) {
						return obj;
					}
				}
				break;
			}

			default:
				break;
		}
	}

	return null;
};
