import { findObjectAtPointPrecise } from '@shared/utils/canvas-helpers';
import { Tool, type Styles, type ToolOptions } from './Tool';

export class EraserTool extends Tool {
	private erased: boolean = false;

	constructor(canvas: HTMLCanvasElement, styles: Styles, options: ToolOptions = {}, zoom: number) {
		super(canvas, styles, options, zoom);
		this.listen();
	}

	listen = () => {
		this.canvas.onpointerdown = this.mouseDownHandler.bind(this);
		this.canvas.onpointermove = this.mouseMoveHandler.bind(this);
		this.canvas.onpointerup = this.mouseUpHandler.bind(this);
	};

	mouseDownHandler = (e: PointerEvent) => {
		if (!this.ctx || !this.onComplete || !this.layerObjects) return;

		const [x, y] = this.getMousePos(e);
		this.isMouseDown = true;
		this.canvas.setPointerCapture(e.pointerId);
		this.erased = false;
		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
		this.erase(x, y);

		const hitObject = this.findObjectAt(x, y);

		if (hitObject) this.onComplete({ id: hitObject.id });
	};

	mouseMoveHandler = (e: PointerEvent) => {
		if (!this.isMouseDown) return;

		const [x, y] = this.getMousePos(e);
		this.erase(x, y);
	};

	mouseUpHandler = (e: PointerEvent) => {
		if (!this.ctx) return;

		this.isMouseDown = false;

		if (!this.erased) {
			const [x, y] = this.getMousePos(e);
			this.singleErase(x, y);
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

	singleErase = (x: number, y: number) => {
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

	private findObjectAt(x: number, y: number) {
		return findObjectAtPointPrecise(this.layerObjects, x, y, { tolerance: 5 });
	}
}
