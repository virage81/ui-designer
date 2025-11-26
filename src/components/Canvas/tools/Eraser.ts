import { Tool, type Styles } from './Tool';

/**
 * Инструмент Ластик
 */
export class EraserTool extends Tool {
	constructor(canvas: HTMLCanvasElement, styles: Styles) {
		super(canvas, styles);
		this.listen();
	}

	listen = () => {
		this.canvas.onpointerdown = this.mouseDownHandler.bind(this);
		this.canvas.onpointermove = this.mouseMoveHandler.bind(this);
		this.canvas.onpointerup = this.mouseUpHandler.bind(this);
	};

	mouseDownHandler = () => {
		if (!this.ctx) return;

		this.isMouseDown = true;
	};

	mouseMoveHandler = (e: MouseEvent) => {
		if (!this.isMouseDown) return;

		this.erase(e.layerX, e.layerY);
	};

	mouseUpHandler = () => {
		this.isMouseDown = false;
	};

	erase = (x: number, y: number) => {
		if (!this.ctx) return;

		this.ctx.clearRect(x - 5, y - 5, this.strokeWidth, this.strokeWidth);
	};
}
