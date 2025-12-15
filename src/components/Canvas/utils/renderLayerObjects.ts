import type { Brush, Circle, Drawable, Line, Rect, Text } from '@shared/types/canvas';

/**
 * Рисует набор объектов на canvas-слое
 * @param canvas - целевой canvas элемент
 * @param objects - объекты, принадлежащие этому слою
 * @param dpr - devicePixelRatio (для масштабирования)
 */
export const renderLayerObjects = (
	canvas: HTMLCanvasElement,
	objects: Drawable[],
	dpr: number = window.devicePixelRatio || 1,
) => {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width * dpr, canvas.height * dpr);

	// Настройки по умолчанию
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.font = '16px Arial';
	ctx.textBaseline = 'top';
	ctx.textAlign = 'left';

	objects.forEach(obj => {
		switch (obj.type) {
			case 'rect': {
				const r = obj as Rect;
				ctx.fillStyle = r.fill;
				ctx.strokeStyle = r.stroke;
				ctx.lineWidth = r.strokeWidth * dpr;
				ctx.beginPath();
				ctx.rect(r.x * dpr, r.y * dpr, r.width * dpr, r.height * dpr);

				ctx.fill();
				if (r.strokeWidth > 0) ctx.stroke();
				break;
			}

			case 'circle': {
				const c = obj as Circle;
				ctx.fillStyle = c.fill;
				ctx.strokeStyle = c.stroke;
				ctx.lineWidth = c.strokeWidth * dpr;
				ctx.beginPath();
				ctx.arc(c.cx * dpr, c.cy * dpr, c.r * dpr, 0, Math.PI * 2);
				ctx.fill();
				if (c.strokeWidth > 0) ctx.stroke();
				break;
			}

			case 'line': {
				const l = obj as Line;
				ctx.strokeStyle = l.stroke;
				ctx.lineWidth = l.strokeWidth * dpr;
				ctx.beginPath();
				ctx.moveTo(l.x1 * dpr, l.y1 * dpr);
				ctx.lineTo(l.x2 * dpr, l.y2 * dpr);
				ctx.stroke();
				break;
			}

			case 'text': {
				const t = obj as Text;
				ctx.fillStyle = t.fill;
				ctx.font = `${t.fontSize * dpr}px Arial`;
				// const lines = t.lines || t.text.split('\n');
				const lines = t.text.split('\n');
				const lineHeight = t.fontSize * 1.2 * dpr;

				lines.forEach((line, i) => {
					const y = (t.y + i * lineHeight) * dpr;
					if (y > canvas.height * dpr) return;
					ctx.fillText(line, t.x * dpr, y);
				});
				break;
			}

			case 'brush': {
				const b = obj as Brush;
				// if (b.points.length === 0) break;
				if (b.points.length < 2) break;

				ctx.strokeStyle = b.stroke;
				ctx.lineWidth = b.strokeWidth * dpr;
				ctx.beginPath();
				ctx.moveTo(b.points[0].x * dpr, b.points[0].y * dpr);

				for (let i = 1; i < b.points.length; i++) {
					ctx.lineTo(b.points[i].x * dpr, b.points[i].y * dpr);
				}
				ctx.stroke();
				break;
			}

			default:
				break;
		}
	});
};
