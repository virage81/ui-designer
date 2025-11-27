import type { BrushTool } from './Brush';
import type { CircleTool } from './Circle';
import type { EraserTool } from './Eraser';
import type { LineTool } from './Line';
import type { RectangleTool } from './Rect';
import type { TextTool } from './Text';

export type Styles = {
	strokeWidth: number;
	fill: string;
	strokeStyle: string;
};

export class Tool {
	protected canvas;
	protected ctx;
	protected dpr: number = 1;
	protected logicalWidth: number = 0;
	protected logicalHeight: number = 0;

	protected strokeWidth: number = 1;
	protected fill: string = '#3b78e7';
	protected stroke: string = '#000';

	protected isMouseDown: boolean = false;

	constructor(canvas: HTMLCanvasElement, styles: Styles) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
		this.dpr = window.devicePixelRatio || 1;

		this.logicalWidth = parseInt(canvas.style.width) || canvas.width / this.dpr;
		this.logicalHeight = parseInt(canvas.style.height) || canvas.height / this.dpr;

		this.fill = styles.fill;
		this.stroke = styles.strokeStyle;
		this.strokeWidth = styles.strokeWidth;

		this.destroyEvents();
		this.applyStyles(styles);
	}

	applyStyles(styles: Styles) {
		if (!this.ctx) return;

		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = styles.strokeWidth;
		this.ctx.strokeStyle = styles.strokeStyle;
		this.ctx.fillStyle = styles.fill;
	}

	public getMousePos(e: PointerEvent): [number, number] {
		const rect = this.canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		return [x, y];
	}

	destroyEvents() {
		this.canvas.onpointerup = null;
		this.canvas.onpointermove = null;
		this.canvas.onpointerdown = null;
	}
}

export type Tools = BrushTool | RectangleTool | CircleTool | LineTool | EraserTool | TextTool;
