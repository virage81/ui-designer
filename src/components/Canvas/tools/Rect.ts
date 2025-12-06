import { Tool, type Styles } from './Tool';

export class RectangleTool extends Tool {
	private saved: string = '';
	private width: number = 0;
	private height: number = 0;
	private startX: number = 0;
	private startY: number = 0;

	constructor(canvas: HTMLCanvasElement, styles: Styles, zoom: number, snapToGrid?: (x: number, y: number) => [number, number]) {
		super(canvas, styles, zoom, snapToGrid);
		this.listen();
	}

	listen() {
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
	}

	mouseUpHandler() {
		this.isMouseDown = false;
	}

	mouseDownHandler(e: PointerEvent) {
		this.isMouseDown = true;
		this.canvas.setPointerCapture(e.pointerId);
		const [x, y] = this.getMousePos(e);

		this.ctx.beginPath();
		this.startX = x;
		this.startY = y;
		this.saved = this.canvas.toDataURL();
	}

	mouseMoveHandler(e: PointerEvent) {
		if (this.isMouseDown) {
			const [currentX, currentY] = this.getMousePos(e);
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

			this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
			this.ctx.drawImage(img, 0, 0, this.logicalWidth, this.logicalHeight);

			this.ctx.beginPath();
			this.ctx.fillStyle = this.fill;
			this.ctx.rect(x, y, w, h);
			this.ctx.fill();
			this.ctx.stroke();
		};
	}
}
