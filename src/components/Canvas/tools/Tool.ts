import type { BrushTool } from './Brush';
import type { CircleTool } from './Circle';
import type { EraserTool } from './Eraser';
import type { LineTool } from './Line';
import type { RectangleTool } from './Rect';
import type { TextTool } from './Text';

export type Styles = {
	fontSize: number;
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

	protected fontSize: number;
	protected strokeWidth: number;
	protected fill: string;
	protected stroke: string;

	protected isMouseDown: boolean = false;

	protected zoom: number = 1;

	protected snapToGrid?: (x: number, y: number) => [number, number];

	protected eventCleanup?: () => void;

	constructor(canvas: HTMLCanvasElement, styles: Styles, zoom: number, snapToGrid?: (x: number, y: number) => [number, number]) {
		this.canvas = canvas;

		this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
		this.dpr = window.devicePixelRatio || 1;

		this.logicalWidth = parseInt(canvas.style.width) || canvas.width / this.dpr;
		this.logicalHeight = parseInt(canvas.style.height) || canvas.height / this.dpr;

		this.fontSize = styles.fontSize;
		this.strokeWidth = styles.strokeWidth;
		this.fill = styles.fill;
		this.stroke = styles.strokeStyle;

		this.zoom = zoom;

		this.snapToGrid = snapToGrid;

		this.destroyEvents();
		this.setupEvents();
		this.applyStyles(styles);
	}

	applyStyles(styles: Styles) {
		if (!this.ctx) return;

		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';
		this.ctx.font = `${styles.fontSize}px Arial`;
		this.ctx.lineWidth = styles.strokeWidth;
		this.ctx.fillStyle = styles.fill;
		this.ctx.strokeStyle = styles.strokeStyle;

		this.fontSize = styles.fontSize;
		this.strokeWidth = styles.strokeWidth;
		this.fill = styles.fill;
		this.stroke = styles.strokeStyle;
	}

	public getMousePos(e: PointerEvent): [number, number] {
		const rect = this.canvas.getBoundingClientRect();
		const [x, y] = [(e.clientX - rect.left) / this.zoom, (e.clientY - rect.top) / this.zoom];

		return this.snapToGrid ? this.snapToGrid(x, y) : [x, y];
	}

	setupEvents() {
		this.canvas.onmouseleave = () => {
			this.isMouseDown = false;
			this.ctx.closePath();
		};
	}

	destroyEvents() {
		this.canvas.onpointerup = null;
		this.canvas.onpointermove = null;
		this.canvas.onpointerdown = null;
		this.canvas.onmouseleave = null;

		if (this.eventCleanup) {
			this.eventCleanup();
			this.eventCleanup = undefined;
		}
	}
}

export type Tools = BrushTool | RectangleTool | CircleTool | LineTool | EraserTool | TextTool;
