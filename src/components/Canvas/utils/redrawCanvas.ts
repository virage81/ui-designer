import type { Drawable } from '@shared/types/canvas';

export const redrawCanvas = (
	canvas: HTMLCanvasElement,
	objects: Drawable[] = [],
	pointer: number,
) => {
	if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
		console.error('Invalid canvas element:', canvas);
		return;
	}

	const ctx = canvas.getContext?.('2d');

	if (!ctx) {
		console.error('Failed to get 2D context for canvas:', canvas);
		return;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	objects.forEach((obj) => {
		if (obj.pointer >= 0 && pointer >= obj.pointer && !obj.removed) {
			switch (obj.type) {
				case 'brush': {
					if (!obj.points || obj.points.length < 2) return;

					ctx.strokeStyle = obj.stroke;
					ctx.lineWidth = obj.strokeWidth;
					ctx.lineCap = 'round';
					ctx.lineJoin = 'round';
					ctx.miterLimit = 10;

					ctx.beginPath();
					ctx.moveTo(obj.points[0].x, obj.points[0].y);

					for (let i = 1; i < obj.points.length; i++) {
						const curr = obj.points[i];
						const prev = obj.points[i - 1];

						const cx = (prev.x + curr.x) / 2;
						const cy = (prev.y + curr.y) / 2;

						ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
					}

					ctx.stroke();
					break;
				}
				case 'rect': {
					ctx.fillStyle = obj.fill;
					ctx.strokeStyle = obj.stroke;
					ctx.lineWidth = obj.strokeWidth;
					ctx.beginPath();
					ctx.rect(obj.x, obj.y, obj.width, obj.height);
					ctx.fill();
					if (obj.strokeWidth > 0) ctx.stroke();
					break;
				}
				case 'circle': {
					ctx.fillStyle = obj.fill;
					ctx.strokeStyle = obj.stroke;
					ctx.lineWidth = obj.strokeWidth;
					ctx.beginPath();
					ctx.arc(obj.cx, obj.cy, obj.r, 0, Math.PI * 2);
					ctx.fill();
					if (obj.strokeWidth > 0) ctx.stroke();
					break;
				}
				case 'line': {
					ctx.strokeStyle = obj.stroke;
					ctx.lineWidth = obj.strokeWidth;
					ctx.beginPath();
					ctx.moveTo(obj.x1, obj.y1);
					ctx.lineTo(obj.x2, obj.y2);
					ctx.stroke();
					break;
				}
				case 'text': {
					ctx.font = `${obj.fontSize}px Arial`;
					ctx.fillStyle = obj.fill;
					ctx.textBaseline = 'top';
					ctx.textAlign = 'left';

					if (obj.lines) {
						obj.lines.forEach((line, i) => {
							const lineY = obj.y + i * (obj.fontSize * 1.2);
							ctx.fillText(line, obj.x, lineY);
						});
					}

					break;
				}
				default:
					break;
			}
		}
	});
};
