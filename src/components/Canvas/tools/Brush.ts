// import { generateId } from '@shared/helpers';
// import type { Brush } from '@shared/types/canvas';
// import { Tool, type Styles, type ToolOptions } from './Tool';
import { Tool, type Styles } from './Tool';

export class BrushTool extends Tool {
	constructor(canvas: HTMLCanvasElement, styles: Styles, zoom: number, snapToGrid?: (x: number, y: number) => [number, number]) {
		super(canvas, styles, zoom, snapToGrid);
		// private currentPath: { x: number; y: number }[] = [];
		// private pathId: string = '';
		// private savedImage?: ImageData;

		// constructor(canvas: HTMLCanvasElement, styles: Styles, options: ToolOptions = {}, zoom: number, snapToGrid?: (x: number, y: number) => [number, number],) {
		// 	super(canvas, styles, options, zoom, snapToGrid);
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

		// this.currentPath = [{ x, y }];
		// this.pathId = generateId();

		// this.savedImage = this.ctx.getImageData(0, 0, this.logicalWidth, this.logicalHeight);

		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
	};

	mouseMoveHandler = (e: PointerEvent) => {
		if (!this.isMouseDown) return;
		// if (!this.isMouseDown || !this.ctx) return;

		const [x, y] = this.getMousePos(e);
		// this.currentPath.push({ x, y });

		this.draw(x, y);
	};

	mouseUpHandler = () => {
		// if (!this.isMouseDown || !this.ctx || this.currentPath.length < 2) {
		// 	this.isMouseDown = false;
		// 	return;
		// }

		// const path: Brush = {
		// 	id: this.pathId,
		// 	type: 'brush',
		// 	points: [...this.currentPath],
		// 	stroke: this.fill,
		// 	strokeWidth: this.strokeWidth,
		// 	layerId: this.layerId || 'default',
		// };

		// this.onComplete?.(path);

		this.isMouseDown = false;
		// this.currentPath = [];
		// this.savedImage = undefined;
	};

	draw(x: number, y: number) {
		if (!this.ctx) return;
		// if (!this.ctx || !this.savedImage) return;

		// this.ctx.putImageData(this.savedImage, 0, 0);

		// this.ctx.beginPath();
		// this.ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);

		// for (let i = 1; i < this.currentPath.length; i++) {
		// 	this.ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y);
		// }

		this.ctx.strokeStyle = this.fill;
		this.ctx.lineWidth = this.strokeWidth;
		this.ctx.lineTo(x, y);
		this.ctx.stroke();
		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
	}
}
