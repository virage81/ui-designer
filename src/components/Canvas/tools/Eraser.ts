import { Tool, type Styles } from './Tool';

/**
 * Инструмент Ластик
 */
export class EraserTool extends Tool {
	private erased: boolean = false;

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
		this.erased = false;
		this.ctx.beginPath();
		this.ctx.moveTo(e.layerX, e.layerY);
	};

	mouseMoveHandler = (e: MouseEvent) => {
		if (!this.isMouseDown) return;

		this.erase(e.layerX, e.layerY);
	};

	mouseUpHandler = (e: PointerEvent) => {
		if (!this.ctx) return;

		this.isMouseDown = false;

		if (!this.erased) {
			this.signleErase(e.layerX, e.layerY);
		}
	};

	erase = (x: number, y: number) => {
		if (!this.ctx) return;

		this.ctx.save();
		this.ctx.globalCompositeOperation = 'destination-out';
		this.ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
		this.ctx.lineWidth = this.strokeWidth;
		this.ctx.lineTo(x, y);
		this.ctx.stroke();
		this.ctx.restore();
		this.erased = true;
	};

	signleErase = (x: number, y: number) => {
		if (!this.ctx) return;

		this.ctx.save();
		this.ctx.globalCompositeOperation = 'destination-out';
		this.ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
		this.ctx.lineCap = 'square';
		this.ctx.lineJoin = 'miter';
		this.ctx.rect(x, y, this.strokeWidth / 32, this.strokeWidth / 32);
		this.ctx.stroke();
		this.ctx.restore();
	};
}
