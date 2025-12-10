import type { BBox, Brush, Circle, Drawable, Line, Rect, Text } from '@shared/types/canvas';
import { findObjectAtPoint, getBoundingBox } from '@shared/utils/canvas-helpers';
import { Tool, type Styles, type ToolOptions } from './Tool';

export class SelectTool extends Tool {
	private selectedObject: (Rect | Circle | Line | Text) | null = null;
	private isDragging = false;
	private dragOffsetX = 0;
	private dragOffsetY = 0;

	private previewRectX = 0;
	private previewRectY = 0;

	private previewCircleCx = 0;
	private previewCircleCy = 0;

	private previewLineX1 = 0;
	private previewLineY1 = 0;
	private previewLineX2 = 0;
	private previewLineY2 = 0;

	private previewTextX = 0;
	private previewTextY = 0;

	protected layerObjects: Drawable[] = [];
	private guides: { enabled: boolean, columns: number, rows: number };

	constructor(canvas: HTMLCanvasElement, styles: Styles, options: ToolOptions = {}, zoom: number, snapToGrid?: (x: number, y: number) => [number, number], guides?: { enabled: boolean, columns: number, rows: number }) {
		super(canvas, styles, options, zoom, snapToGrid);

		this.guides = guides || { enabled: false, columns: 1, rows: 1 };
		this.layerObjects = options.layerObjects || [];

		this.listen();
	}

	updateLayerObjects(objects: Drawable[]) {
		this.layerObjects = objects;
	}

	private getRawMousePos(e: PointerEvent): [number, number] {
		const rect = this.canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) / this.zoom;
		const y = (e.clientY - rect.top) / this.zoom;
		return [x, y];
	}

	private getGuideLines(): { vertical: number[], horizontal: number[] } {
		if (!this.guides.enabled) return { vertical: [], horizontal: [] };

		const projectWidth = this.canvas.width / this.dpr;
		const projectHeight = this.canvas.height / this.dpr;

		const gridW = projectWidth / this.guides.columns;
		const gridH = projectHeight / this.guides.rows;

		const vertical: number[] = [];
		const horizontal: number[] = [];

		for (let i = 0; i <= this.guides.columns; i++) {
			vertical.push(i * gridW);
		}
		for (let i = 0; i <= this.guides.rows; i++) {
			horizontal.push(i * gridH);
		}

		return { vertical, horizontal };
	}

	listen() {
		this.canvas.onpointerdown = this.onPointerDown.bind(this);
		this.canvas.onpointermove = this.onPointerMove.bind(this);
		this.canvas.onpointerup = this.onPointerUp.bind(this);
	}

	onPointerDown(e: PointerEvent) {
		const [x, y] = this.getRawMousePos(e);
		const objects = this.getLayerObjects();
		const clickedObject = findObjectAtPoint(objects, x, y);

		if (!clickedObject || !['rect', 'circle', 'line', 'text'].includes(clickedObject.type)) {
			this.selectedObject = null;
			this.renderAll();
			return;
		}

		this.selectedObject = clickedObject as Rect | Circle | Line | Text;
		this.isDragging = true;

		const bbox = getBoundingBox(clickedObject);
		const centerX = bbox.x + bbox.width / 2;
		const centerY = bbox.y + bbox.height / 2;

		this.dragOffsetX = x - centerX;
		this.dragOffsetY = y - centerY;

		switch (clickedObject.type) {
			case 'rect':
				this.previewRectX = clickedObject.x;
				this.previewRectY = clickedObject.y;
				break;
			case 'circle':
				this.previewCircleCx = clickedObject.cx;
				this.previewCircleCy = clickedObject.cy;
				break;
			case 'line':
				this.previewLineX1 = clickedObject.x1;
				this.previewLineY1 = clickedObject.y1;
				this.previewLineX2 = clickedObject.x2;
				this.previewLineY2 = clickedObject.y2;
				break;
			case 'text':
				this.previewTextX = clickedObject.x;
				this.previewTextY = clickedObject.y;
				break;
		}

		this.renderWithPreview();
	}



	onPointerMove(e: PointerEvent) {
		if (!this.isDragging || !this.selectedObject) return;

		const [mouseX, mouseY] = this.getRawMousePos(e);
		const bbox = getBoundingBox(this.selectedObject);

		const newCenterX = mouseX - this.dragOffsetX;
		const newCenterY = mouseY - this.dragOffsetY;

		let baseLeft = newCenterX - bbox.width / 2;
		let baseTop = newCenterY - bbox.height / 2;


		if (this.guides.enabled) {
			const { vertical: guidesX, horizontal: guidesY } = this.getGuideLines();
			const tolerance = 8;

			const findNearestGuide = (pos: number, lines: number[]): number | null => {
				let nearest = null;
				let minDist = tolerance + 1;
				for (const line of lines) {
					const dist = Math.abs(pos - line);
					if (dist < minDist) {
						minDist = dist;
						nearest = line;
					}
				}
				return nearest;
			};


			const testLeft = baseLeft;
			const testRight = baseLeft + bbox.width;
			const testTop = baseTop;
			const testBottom = baseTop + bbox.height;

			const snapLeft = findNearestGuide(testLeft, guidesX);
			const snapRight = findNearestGuide(testRight, guidesX);
			const snapTop = findNearestGuide(testTop, guidesY);
			const snapBottom = findNearestGuide(testBottom, guidesY);


			if (snapLeft !== null) {
				baseLeft = snapLeft;
			} else if (snapRight !== null) {
				baseLeft = snapRight - bbox.width;
			}


			if (snapTop !== null) {
				baseTop = snapTop;
			} else if (snapBottom !== null) {
				baseTop = snapBottom - bbox.height;
			}
		}


		switch (this.selectedObject.type) {
			case 'rect':
				this.previewRectX = baseLeft;
				this.previewRectY = baseTop;
				break;
			case 'circle':
				this.previewCircleCx = baseLeft + (this.selectedObject as Circle).r;
				this.previewCircleCy = baseTop + (this.selectedObject as Circle).r;
				break;
			case 'text':
				this.previewTextX = baseLeft;
				this.previewTextY = baseTop;
				break;
			case 'line': {
				const centerX = (this.previewLineX1 + this.previewLineX2) / 2;
				const centerY = (this.previewLineY1 + this.previewLineY2) / 2;
				const dx = baseLeft + bbox.width / 2 - centerX;
				const dy = baseTop + bbox.height / 2 - centerY;
				this.previewLineX1 += dx;
				this.previewLineY1 += dy;
				this.previewLineX2 += dx;
				this.previewLineY2 += dy;
				break;
			}
		}

		this.renderWithPreview();
	}

	onPointerUp() {
		if (this.selectedObject && this.onComplete) {
			const { type, id } = this.selectedObject;

			const typeHandlers = {
				rect: () => ({ x: this.previewRectX, y: this.previewRectY }),
				circle: () => ({ cx: this.previewCircleCx, cy: this.previewCircleCy }),
				line: () => ({
					x1: this.previewLineX1,
					y1: this.previewLineY1,
					x2: this.previewLineX2,
					y2: this.previewLineY2,
				}),
				text: () => ({ x: this.previewTextX, y: this.previewTextY }),
			};

			const handler = typeHandlers[type];
			if (handler) {
				this.onComplete({
					id,
					updates: handler(),
				});
			}
		}

		this.isDragging = false;
		this.selectedObject = null;
	}

	private getLayerObjects(): Drawable[] {
		return this.layerObjects || [];
	}

	private renderWithPreview() {
		const ctx = this.ctx;
		const objects = this.getLayerObjects();

		ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

		for (const obj of objects) {
			const previewObj = this.getPreviewObject(obj);
			this.drawObject(ctx, previewObj);
		}

		this.drawBoundingBoxSelected();
	}

	private renderAll() {
		const ctx = this.ctx;
		const objects = this.getLayerObjects();

		ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

		for (const obj of objects) {
			if (obj.type === 'rect') this.drawRect(ctx, obj as Rect);
			if (obj.type === 'circle') this.drawCircle(ctx, obj as Circle);
			if (obj.type === 'line') this.drawLine(ctx, obj as Line);
			if (obj.type === 'text') this.drawText(ctx, obj as Text);
			if (obj.type === 'brush') this.drawBrush(ctx, obj as Brush);
		}

		if (this.selectedObject) {
			const bbox = getBoundingBox(this.selectedObject);
			ctx.strokeStyle = '#007bff';
			ctx.lineWidth = 1 / this.dpr;
			ctx.setLineDash([4 / this.dpr, 4 / this.dpr]);
			ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
			ctx.setLineDash([]);
		}
	}

	private getPreviewObject(obj: Drawable): Drawable {
		if (obj.id !== this.selectedObject?.id) return obj;

		switch (obj.type) {
			case 'rect':
				return { ...obj, x: this.previewRectX, y: this.previewRectY };
			case 'circle':
				return { ...obj, cx: this.previewCircleCx, cy: this.previewCircleCy };
			case 'line':
				return {
					...obj,
					x1: this.previewLineX1,
					y1: this.previewLineY1,
					x2: this.previewLineX2,
					y2: this.previewLineY2,
				};
			case 'text':
				return { ...obj, x: this.previewTextX, y: this.previewTextY };
			default:
				return obj;
		}
	}

	private getPreviewBoundingBox(): BBox {
		switch (this.selectedObject!.type) {
			case 'rect': {
				const rect = this.selectedObject as Rect;
				return {
					x: this.previewRectX,
					y: this.previewRectY,
					width: rect.width,
					height: rect.height,
				};
			}

			case 'circle': {
				const circle = this.selectedObject as Circle;
				return {
					x: this.previewCircleCx - circle.r,
					y: this.previewCircleCy - circle.r,
					width: circle.r * 2,
					height: circle.r * 2,
				};
			}

			case 'line': {
				const x1 = Math.min(this.previewLineX1, this.previewLineX2);
				const y1 = Math.min(this.previewLineY1, this.previewLineY2);
				const x2 = Math.max(this.previewLineX1, this.previewLineX2);
				const y2 = Math.max(this.previewLineY1, this.previewLineY2);
				return {
					x: x1,
					y: y1,
					width: x2 - x1,
					height: y2 - y1,
				};
			}

			case 'text': {
				const text = this.selectedObject as Text;
				const previewObj = {
					...text,
					x: this.previewTextX,
					y: this.previewTextY,
				};
				return getBoundingBox(previewObj);
			}

			default:
				return { x: 0, y: 0, width: 0, height: 0 };
		}
	}

	private drawObject(ctx: CanvasRenderingContext2D, obj: Drawable) {
		switch (obj.type) {
			case 'rect':
				this.drawRect(ctx, obj);
				break;
			case 'circle':
				this.drawCircle(ctx, obj);
				break;
			case 'line':
				this.drawLine(ctx, obj);
				break;
			case 'text':
				this.drawText(ctx, obj);
				break;
			case 'brush':
				this.drawBrush(ctx, obj as Brush);
				break;
		}
	}

	private drawBoundingBoxSelected() {
		if (!this.selectedObject) return;

		const previewBbox = this.getPreviewBoundingBox();
		this.drawBoundingBox(previewBbox);
	}

	private drawBoundingBox(bbox: BBox) {
		const ctx = this.ctx;
		const lineWidth = 2 / this.dpr;
		const dashPattern = [4 / this.dpr, 4 / this.dpr];

		ctx.strokeStyle = '#007bff';
		ctx.lineWidth = lineWidth;
		ctx.setLineDash(dashPattern);
		ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
		ctx.setLineDash([]);
	}

	private drawRect(ctx: CanvasRenderingContext2D, rect: Rect) {
		ctx.fillStyle = rect.fill;
		ctx.strokeStyle = rect.stroke;
		ctx.lineWidth = rect.strokeWidth;
		ctx.beginPath();
		ctx.rect(rect.x, rect.y, rect.width, rect.height);
		ctx.fill();
		ctx.stroke();
	}

	private drawCircle(ctx: CanvasRenderingContext2D, circle: Circle) {
		ctx.fillStyle = circle.fill;
		ctx.strokeStyle = circle.stroke;
		ctx.lineWidth = circle.strokeWidth;
		ctx.beginPath();
		ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}

	private drawLine(ctx: CanvasRenderingContext2D, line: Line) {
		ctx.strokeStyle = line.stroke;
		ctx.lineWidth = line.strokeWidth;
		ctx.beginPath();
		ctx.moveTo(line.x1, line.y1);
		ctx.lineTo(line.x2, line.y2);
		ctx.stroke();
	}

	private drawText(ctx: CanvasRenderingContext2D, text: Text) {
		ctx.fillStyle = text.fill;
		ctx.font = `${text.fontSize}px Arial`;
		ctx.textBaseline = 'top';
		ctx.textAlign = 'left';

		const lines = text.lines || text.text.split('\n');
		const lineHeight = text.fontSize * 1.2;

		for (let i = 0; i < lines.length; i++) {
			const lineY = text.y + i * lineHeight;
			ctx.fillText(lines[i], text.x, lineY);
		}
	}

	private drawBrush(ctx: CanvasRenderingContext2D, brush: Brush) {
		if (brush.points.length < 2) return;

		ctx.beginPath();
		ctx.moveTo(brush.points[0].x, brush.points[0].y);

		for (let i = 1; i < brush.points.length; i++) {
			ctx.lineTo(brush.points[i].x, brush.points[i].y);
		}

		ctx.strokeStyle = brush.stroke;
		ctx.lineWidth = brush.strokeWidth;
		ctx.stroke();
	}
}
