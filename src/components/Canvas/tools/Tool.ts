import type { BrushTool } from './Brush';
import type { LineTool } from './Line';
import type { RectangleTool } from './Rect';

export type Styles = {
	strokeWidth: number;
	fill: string;
};

export class Tool {
	protected canvas;
	protected ctx;

	protected strokeWidth: number = 1;
	protected fill: string = '#000';

	protected isMouseDown: boolean = false;

	constructor(canvas: HTMLCanvasElement, styles: Styles) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.fill = styles.fill;
		this.strokeWidth = styles.strokeWidth;

		this.destroyEvents();
		this.applyStyles(styles);
	}

	applyStyles(styles: Styles) {
		if (!this.ctx) return;

		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = styles.strokeWidth;
		this.ctx.strokeStyle = styles.fill;
	}

	destroyEvents = () => {
		this.canvas.onpointerup = null;
		this.canvas.onpointermove = null;
		this.canvas.onpointerdown = null;
	};
}

export type Tools = BrushTool | RectangleTool | LineTool;
