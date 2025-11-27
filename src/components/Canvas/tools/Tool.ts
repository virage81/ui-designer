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

	protected strokeWidth: number = 1;
	protected fill: string = '#3b78e7';
	protected stroke: string = '#000';

	protected isMouseDown: boolean = false;

	constructor(canvas: HTMLCanvasElement, styles: Styles) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
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

	destroyEvents() {
		this.canvas.onpointerup = null;
		this.canvas.onpointermove = null;
		this.canvas.onpointerdown = null;
	}
}

export type Tools = BrushTool | RectangleTool | CircleTool | LineTool | EraserTool | TextTool;
