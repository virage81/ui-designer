import { generateId } from '@shared/helpers';
import type { Line } from '@shared/types/canvas';
import { Tool, type Styles, type ToolOptions } from './Tool';

export class LineTool extends Tool {
	private saved: string = '';
	private startX: number = 0;
	private startY: number = 0;
	private currentX: number = 0;
	private currentY: number = 0;

	constructor(canvas: HTMLCanvasElement, styles: Styles, options: ToolOptions = {}, zoom: number) {
		super(canvas, styles, options, zoom);
		this.listen();
	}

	listen() {
		this.canvas.onpointerdown = this.mouseDownHandler.bind(this);
		this.canvas.onpointermove = this.mouseMoveHandler.bind(this);
		this.canvas.onpointerup = this.mouseUpHandler.bind(this);
	}

	mouseDownHandler(e: PointerEvent) {
		this.isMouseDown = true;

		const [x, y] = this.getMousePos(e);
		this.ctx.beginPath();
		this.startX = x;
		this.startY = y;
		this.currentX = x;
		this.currentY = y;
		this.saved = this.canvas.toDataURL();
	}

	mouseMoveHandler(e: PointerEvent) {
		if (!this.isMouseDown) return;

		const [x, y] = this.getMousePos(e);
		this.currentX = x;
		this.currentY = y;
		this.draw(this.startX, this.startY, this.currentX, this.currentY);
	}

	mouseUpHandler() {
		this.isMouseDown = false;

		const line: Line = {
			id: generateId(),
			type: 'line',
			x1: this.startX,
			y1: this.startY,
			x2: this.currentX,
			y2: this.currentY,
			stroke: this.fill,
			strokeWidth: this.strokeWidth,
			layerId: this.layerId || 'default',
		};

		this.onComplete?.(line);
	}

	draw(x1: number, y1: number, x2: number, y2: number) {
		const img = new Image();
		img.src = this.saved;
		img.onload = () => {
			if (!this.ctx) return;

			this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
			this.ctx.drawImage(img, 0, 0, this.logicalWidth, this.logicalHeight);

			this.ctx.strokeStyle = this.fill;
			this.ctx.lineWidth = this.strokeWidth;
			this.ctx.beginPath();
			this.ctx.moveTo(x1, y1);
			this.ctx.lineTo(x2, y2);
			this.ctx.stroke();
		};
	}
}
