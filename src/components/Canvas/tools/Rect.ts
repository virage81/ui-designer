import { Tool, type Styles } from './Tool';

/**
 * Инструмент прямоугольник
 */
export class RectangleTool extends Tool {
	private saved: string = '';
	private width: number = 0;
	private height: number = 0;
	private startX: number = 0;
	private startY: number = 0;

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
			const currentX = e.layerX;
			const currentY = e.layerY;
			this.width = currentX - this.startX;
			this.height = currentY - this.startY;
			this.draw(this.startX, this.startY, this.width, this.height);
		}
	}

	draw(x: number, y: number, w: number, h: number) {
		const img = new Image();
		img.src = this.saved;
		img.onload = () => {
			if (!this.ctx) return;

			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
			this.ctx.beginPath();
			this.ctx.rect(x, y, w, h);
			this.ctx.fill();
			this.ctx.stroke();
		};
	}
}
