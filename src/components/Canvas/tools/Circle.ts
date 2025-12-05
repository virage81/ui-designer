import { Tool, type Styles } from './Tool';

export class CircleTool extends Tool {
	private saved: string = '';
	private radius: number = 0;
	private startX: number = 0;
	private startY: number = 0;

	constructor(canvas: HTMLCanvasElement, styles: Styles, zoom: number) {
		super(canvas, styles, zoom);
		this.listen();
	}

	listen() {
		this.canvas.onpointerdown = this.mouseDownHandler.bind(this);
		this.canvas.onpointermove = this.mouseMoveHandler.bind(this);
		this.canvas.onpointerup = this.mouseUpHandler.bind(this);
	}

	mouseDownHandler(e: PointerEvent) {
		this.isMouseDown = true;

		const [x, y] = this.getMousePos(e);
		this.ctx.beginPath();
		this.startX = x;
		this.startY = y;
		this.saved = this.canvas.toDataURL();
	}

	mouseMoveHandler(e: PointerEvent) {
		if (!this.isMouseDown) return;

		const [currentX, currentY] = this.getMousePos(e);

		this.radius = Math.sqrt((currentX - this.startX) ** 2 + (currentY - this.startY) ** 2);

		this.draw(this.startX, this.startY, this.radius);
	}

	mouseUpHandler() {
		this.isMouseDown = false;
	}

	draw(x: number, y: number, radius: number) {
		const img = new Image();
		img.src = this.saved;
		img.onload = () => {
			if (!this.ctx) return;

			this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
			this.ctx.drawImage(img, 0, 0, this.logicalWidth, this.logicalHeight);

			this.ctx.fillStyle = this.fill;
			this.ctx.beginPath();
			this.ctx.arc(x, y, radius, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.stroke();
		};
	}
}
