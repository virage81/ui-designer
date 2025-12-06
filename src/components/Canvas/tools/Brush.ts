import { Tool, type Styles } from './Tool';

export class BrushTool extends Tool {
	constructor(canvas: HTMLCanvasElement, styles: Styles, zoom: number, snapToGrid?: (x: number, y: number) => [number, number]) {
		super(canvas, styles, zoom, snapToGrid);
		this.listen();
	}

	listen = () => {
		this.canvas.onpointerdown = this.mouseDownHandler.bind(this);
		this.canvas.onpointermove = this.mouseMoveHandler.bind(this);
		this.canvas.onpointerup = this.mouseUpHandler.bind(this);

		const handleGlobalUp = () => {
			this.isMouseDown = false;
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
