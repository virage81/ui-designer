import type { Brush, Circle, Drawable, Line, Rect, Text } from '@shared/types/canvas';

/**
 * Рисует набор объектов на canvas-слое
 * @param canvas - целевой canvas элемент
 * @param objects - объекты, принадлежащие этому слою
 */
export const renderLayerObjects = (canvas: HTMLCanvasElement, objects: Drawable[]) => {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

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
				ctx.lineWidth = r.strokeWidth;
				ctx.beginPath();
				ctx.rect(r.x, r.y, r.width, r.height);

				ctx.fill();
				if (r.strokeWidth > 0) ctx.stroke();
				break;
			}

			case 'circle': {
				const c = obj as Circle;
				ctx.fillStyle = c.fill;
				ctx.strokeStyle = c.stroke;
				ctx.lineWidth = c.strokeWidth;
				ctx.beginPath();
				ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
				ctx.fill();
				if (c.strokeWidth > 0) ctx.stroke();
				break;
			}

			case 'line': {
				const l = obj as Line;
				ctx.strokeStyle = l.stroke;
				ctx.lineWidth = l.strokeWidth;
				ctx.beginPath();
				ctx.moveTo(l.x1, l.y1);
				ctx.lineTo(l.x2, l.y2);
				ctx.stroke();
				break;
			}

			case 'text': {
				const t = obj as Text;
				ctx.fillStyle = t.fill;
				ctx.font = `${t.fontSize}px Arial`;
				const lines = t.lines || t.text.split('\n');
				const lineHeight = t.fontSize * 1.2;

				lines.forEach((line, i) => {
					const y = t.y + i * lineHeight;
					if (y > canvas.height) return;
					ctx.fillText(line, t.x, y);
				});
				break;
			}

			case 'brush': {
				const b = obj as Brush;
				if (b.points.length < 2) break;

				ctx.strokeStyle = b.stroke;
				ctx.lineWidth = b.strokeWidth;
				ctx.beginPath();
				ctx.moveTo(b.points[0].x, b.points[0].y);

				for (let i = 1; i < b.points.length; i++) {
					ctx.lineTo(b.points[i].x, b.points[i].y);
				}
				ctx.stroke();
				break;
			}

			default:
				break;
		}
	});
};
