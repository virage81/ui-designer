import { Tool, type Styles } from './Tool';

/**
 * Инструмент линия
 */
export class LineTool extends Tool {
	private saved: string = '';
	private startX: number = 0;
	private startY: number = 0;
	private currentX: number = 0;
	private currentY: number = 0;

	constructor(canvas: HTMLCanvasElement, styles: Styles) {
		super(canvas, styles);
		this.listen();
	}

	listen() {
		this.canvas.onpointerdown = this.mouseDownHandler.bind(this);
		this.canvas.onpointermove = this.mouseMoveHandler.bind(this);
		this.canvas.onpointerup = this.mouseUpHandler.bind(this);
	}

	mouseUpHandler() {
		this.isMouseDown = false;
	}

	mouseDownHandler(e: PointerEvent) {
		this.isMouseDown = true;

		this.ctx?.beginPath();
		this.startX = e.layerX;
		this.startY = e.layerY;
		this.saved = this.canvas.toDataURL();
	}

	mouseMoveHandler(e: PointerEvent) {
		if (this.isMouseDown) {
			this.currentX = e.layerX;
			this.currentY = e.layerY;
			this.draw(this.startX, this.startY, this.currentX, this.currentY);
		}
	}

	draw(x1: number, y1: number, x2: number, y2: number) {
		const img = new Image();
		img.src = this.saved;
		img.onload = () => {
			if (!this.ctx) return;

			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);

			this.ctx.beginPath();
			this.ctx.moveTo(x1, y1);
			this.ctx.lineWidth = this.strokeWidth;
			this.ctx.strokeStyle = this.fill; //TODO в Tool указан, почему-то бордер
			this.ctx.lineTo(x2, y2);
			this.ctx.stroke();
		};
	}
}
