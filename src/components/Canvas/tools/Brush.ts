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
		this.canvas.onpointerdown = this.mouseDownHandler.bind(this);
		this.canvas.onpointermove = this.mouseMoveHandler.bind(this);
		this.canvas.onpointerup = this.mouseUpHandler.bind(this);
	};

	mouseDownHandler = (e: PointerEvent) => {
		if (!this.ctx) return;

		this.isMouseDown = true;
		const [x, y] = this.getMousePos(e);
		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
	};

	mouseMoveHandler = (e: PointerEvent) => {
		if (!this.isMouseDown) return;

		const [x, y] = this.getMousePos(e);
		this.draw(x, y);
	};

	mouseUpHandler = () => {
		this.isMouseDown = false;
	};

	draw = (x: number, y: number) => {
		if (!this.ctx) return;

		this.ctx.lineTo(x, y);
		this.ctx.strokeStyle = this.fill;
		this.ctx.lineWidth = this.strokeWidth;
		this.ctx.stroke();
		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
	};
}

