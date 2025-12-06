import { Tool, type Styles } from './Tool';

export class EraserTool extends Tool {
	private erased: boolean = false;

	constructor(canvas: HTMLCanvasElement, styles: Styles, zoom: number) {
		super(canvas, styles, zoom);
		this.listen();
	}

	listen = () => {
		this.canvas.onpointerdown = this.mouseDownHandler.bind(this);
		this.canvas.onpointermove = this.mouseMoveHandler.bind(this);
		this.canvas.onpointerup = this.mouseUpHandler.bind(this);

		const handleGlobalUp = () => {
			if (this.isMouseDown) {
				this.isMouseDown = false;
			}
		};

		document.addEventListener('pointerup', handleGlobalUp);

		this.eventCleanup = () => {
			document.removeEventListener('pointerup', handleGlobalUp);
			this.canvas.onpointerdown = null;
			this.canvas.onpointermove = null;
			this.canvas.onpointerup = null;
		};
	};

	mouseDownHandler = (e: PointerEvent) => {
		if (!this.ctx) return;

		this.isMouseDown = true;
		this.canvas.setPointerCapture(e.pointerId);
		this.erased = false;
		const [x, y] = this.getMousePos(e);
		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
		this.erase(x, y);
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
}
