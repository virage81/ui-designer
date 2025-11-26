import { Tool, type Styles } from './Tool';

/**
 * Инструмент Кисть
 */
export class BrushTool extends Tool {
	constructor(canvas: HTMLCanvasElement, styles: Styles) {
		super(canvas, styles);
		this.listen();
	}

	listen = () => {
		this.canvas.onpointerup = this.mouseUpHandler.bind(this);
		this.canvas.onpointermove = this.mouseMoveHandler.bind(this);
		this.canvas.onpointerdown = this.mouseDownHandler.bind(this);
	};

	mouseDownHandler = (e: PointerEvent) => {
		if (!this.ctx) return;

		this.isMouseDown = true;
		this.ctx.beginPath();

		this.ctx.moveTo(e.layerX, e.layerY);
	};
	mouseMoveHandler = (e: MouseEvent) => {
		if (!this.isMouseDown) return;

		this.draw(e.layerX, e.layerY);
	};
	mouseUpHandler = () => {
		this.isMouseDown = false;
	};

	draw = (x: number, y: number) => {
		if (!this.ctx) return;

		this.ctx.lineTo(x, y);
		this.ctx.stroke();
		this.ctx.strokeStyle = this.fill;
		this.ctx.lineWidth = this.strokeWidth;
	};
}
