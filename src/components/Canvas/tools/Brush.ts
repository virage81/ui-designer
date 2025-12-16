import { generateId } from '@shared/helpers';
import type { Brush } from '@shared/types/canvas';
import { Tool, type Styles, type ToolOptions } from './Tool';

export class BrushTool extends Tool {
	private currentPath: { x: number; y: number }[] = [];
	private pathId: string = '';
	private savedImage?: ImageData;

	constructor(
		canvas: HTMLCanvasElement,
		styles: Styles,
		options: ToolOptions = {},
		zoom: number,
		snapToGrid?: (x: number, y: number) => [number, number],
	) {
		super(canvas, styles, options, zoom, snapToGrid);
		this.listen();
	}

	listen = () => {
		this.canvas.onpointerdown = this.mouseDownHandler.bind(this);
		this.canvas.onpointermove = this.mouseMoveHandler.bind(this);
		this.canvas.onpointerup = this.mouseUpHandler.bind(this);
	};

	mouseDownHandler = (e: PointerEvent) => {
		if (!this.ctx) return;

		this.isMouseDown = true;
		this.canvas.setPointerCapture(e.pointerId);
		const [x, y] = this.getMousePos(e);

		this.currentPath = [{ x, y }];
		this.pathId = generateId();

		this.savedImage = this.ctx.getImageData(0, 0, this.logicalWidth, this.logicalHeight);

		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
	};

	mouseMoveHandler = (e: PointerEvent) => {
		if (!this.isMouseDown || !this.ctx) return;

		const rect = this.canvas.getBoundingClientRect();
		const isInside =
			e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

		const [x, y] = this.getConstrainedMousePos(e);
		this.currentPath.push({ x, y });

		this.draw(x, y);

		if (!isInside) {
			this.mouseUpHandler(e);
		}
	};

	mouseUpHandler = (e: PointerEvent) => {
		if (!this.isMouseDown || !this.ctx || this.currentPath.length < 2) {
			this.isMouseDown = false;
			return;
		}

		const path: Brush = {
			id: this.pathId,
			type: 'brush',
			points: [...this.currentPath],
			stroke: this.fill,
			strokeWidth: this.strokeWidth,
			layerId: this.layerId || 'default',
		};

		this.onComplete?.(path);

		this.isMouseDown = false;
		this.currentPath = [];
		this.savedImage = undefined;

		this.canvas.releasePointerCapture(e.pointerId);
	};

	draw(x: number, y: number) {
		if (!this.ctx || !this.savedImage) return;

		this.ctx.putImageData(this.savedImage, 0, 0);

		this.ctx.beginPath();
		this.ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);

		for (let i = 1; i < this.currentPath.length; i++) {
			this.ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y);
		}

		this.ctx.strokeStyle = this.fill;
		this.ctx.lineWidth = this.strokeWidth;
		this.ctx.lineTo(x, y);
		this.ctx.stroke();
	}

	private getConstrainedMousePos(e: PointerEvent): [number, number] {
		const rect = this.canvas.getBoundingClientRect();

		const isInside =
			e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

		let clientX = e.clientX;
		let clientY = e.clientY;

		if (!isInside) {
			clientX = Math.max(rect.left, Math.min(e.clientX, rect.right));
			clientY = Math.max(rect.top, Math.min(e.clientY, rect.bottom));
		}

		const x = clientX - rect.left;
		const y = clientY - rect.top;

		const logicalX = (x * this.logicalWidth) / rect.width;
		const logicalY = (y * this.logicalHeight) / rect.height;

		return this.snapToGrid ? this.snapToGrid(logicalX, logicalY) : [logicalX, logicalY];
	}
}
