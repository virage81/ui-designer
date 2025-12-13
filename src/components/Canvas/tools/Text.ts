import { debounce } from '@shared/debounce';
// import { generateId } from '@shared/helpers';
// import type { Text } from '@shared/types/canvas';
// import { Tool, type Styles, type ToolOptions } from './Tool';
import { Tool, type Styles } from './Tool';

interface CanvasBounds {
	left: number;
	top: number;
	right: number;
	bottom: number;
	width: number;
	height: number;
	canvasWidth: number;
	canvasHeight: number;
}

export class TextTool extends Tool {
	private textInput: HTMLTextAreaElement | null = null;
	private isEditing: boolean = false;
	private pendingText: { x: number; y: number; fontSize: number; color: string } | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private isTextEditingRef: React.RefObject<boolean>;
	private guides: { enabled: boolean; columns: number; rows: number } = { enabled: false, columns: 1, rows: 1 };
	private isCtrlPressedRef?: React.RefObject<boolean>;

	constructor(
		canvas: HTMLCanvasElement,
		styles: Styles,
		zoom: number,
		isTextEditingRef: React.RefObject<boolean>,
		container: HTMLDivElement,
		snapToGrid?: (x: number, y: number) => [number, number],
		guides?: { enabled: boolean; columns: number; rows: number }
	) {
		super(canvas, styles, zoom, snapToGrid, container);
		this.createTextInput();
		this.listen();
		this.isTextEditingRef = isTextEditingRef;
		this.guides = guides || { enabled: false, columns: 1, rows: 1 };
	}
	// constructor(
	// 	canvas: HTMLCanvasElement,
	// 	styles: Styles,
	// 	options: ToolOptions = {},
	// 	zoom: number,
	// 	isTextEditingRef: React.RefObject<boolean>,
	// 	container: HTMLDivElement,
	// 	snapToGrid?: (x: number, y: number) => [number, number],
	// 	guides?: { enabled: boolean; columns: number; rows: number },
	// 	isCtrlPressedRef?: React.RefObject<boolean>
	// ) {
	// 	super(canvas, styles, options, zoom, snapToGrid, container);
	// this.isTextEditingRef = isTextEditingRef;
	// 	this.isCtrlPressedRef = isCtrlPressedRef;
	// 	this.guides = guides || { enabled: false, columns: 1, rows: 1 };
	// 	this.createTextInput();
	// 	this.listen();
	// }

	listen = () => {
		this.canvas.onclick = this.clickHandler.bind(this);
	};

	clickHandler = (e: PointerEvent) => {
		if (this.isEditing) return;
		this.isTextEditingRef.current = true;
		const [canvasX, canvasY] = this.getMousePos(e);

		this.startTextInput(canvasX, canvasY);
	};

	private createTextInput() {
		if (this.textInput || !this.container) return;

		this.textInput = document.createElement('textarea');
		Object.assign(this.textInput.style, {
			position: 'fixed',
			overflow: 'hidden',
			display: 'none',
			border: '2px dashed #007bff',
			padding: '2px',
			fontFamily: 'Arial, sans-serif',
			resize: 'both',
			background: 'transparent',
			outline: 'none',
			zIndex: '9999',
			whiteSpace: 'pre',
			scrollbarWidth: 'none',
			lineHeight: '1.2',
		});

		this.container.appendChild(this.textInput);

		this.textInput.addEventListener('keydown', this.handleKeyDown.bind(this));
		this.textInput.addEventListener('blur', this.cancelEditing.bind(this));
		this.textInput.addEventListener('input', this.adjustTextareaHeight.bind(this));

		this.setupResizeObserver();
	}

	private setupResizeObserver() {
		if (!this.textInput) return;

		this.resizeObserver = new ResizeObserver(entries => {
			requestAnimationFrame(() => {
				if (!entries.length) return;
				this.handleResize();
			});
		});

		this.resizeObserver.observe(this.textInput);
	}

	private getCanvasBounds(): CanvasBounds {
		const rect = this.canvas.getBoundingClientRect();
		return {
			left: rect.left,
			top: rect.top,
			right: rect.right,
			bottom: rect.bottom,
			width: rect.width,
			height: rect.height,
			canvasWidth: this.canvas.width,
			canvasHeight: this.canvas.height,
		};
	}

	private handleResize = debounce(() => {
		if (!this.textInput) return;

		const bounds = this.getCanvasBounds();
		const rect = this.textInput.getBoundingClientRect();

		const isOutOfBounds = rect.right > bounds.right || rect.bottom > bounds.bottom;

		if (isOutOfBounds) {
			this.resizeObserver?.unobserve(this.textInput);

			if (rect.right > bounds.right) {
				this.textInput.style.width = bounds.right - rect.left + 'px';
			}
			if (rect.bottom > bounds.bottom) {
				this.textInput.style.height = bounds.bottom - rect.top + 'px';
			}

			requestAnimationFrame(() => {
				if (this.textInput && this.resizeObserver) {
					this.resizeObserver.observe(this.textInput);
				}
			});
		}

		this.updateBorderColor(rect, bounds);
	}, 50);

	private updateBorderColor(rect: DOMRect, bounds: CanvasBounds) {
		if (!this.textInput) return;

		const isOutOfBounds = rect.right > bounds.right || rect.bottom > bounds.bottom;
		this.textInput.style.borderColor = isOutOfBounds ? 'red' : '#007bff';
	}

	private startTextInput(x: number, y: number) {
		if (!this.ctx) return;

		this.isEditing = true;
		this.pendingText = { x: x, y: y, fontSize: this.fontSize, color: this.fill };

		Object.assign(this.textInput!.style, {
			display: 'block',
			left: x + 'px',
			top: y + 'px',
			width: '200px',
			height: 'auto',
			minHeight: '1lh',
			fontSize: this.fontSize + 'px',
			color: this.fill,
		});

		this.textInput!.value = '';
		this.adjustTextareaHeight();

		requestAnimationFrame(() => this.textInput?.focus());
	}

	private adjustTextareaHeight = () => {
		if (!this.textInput) return;

		const bounds = this.getCanvasBounds();

		this.textInput.style.height = 'auto';
		this.textInput.style.height = this.textInput.scrollHeight + 'px';

		const rect = this.textInput.getBoundingClientRect();

		if (rect.right > bounds.right) {
			this.textInput.style.width = bounds.right - rect.left + 'px';
		}
		if (rect.bottom > bounds.bottom) {
			this.textInput.style.height = bounds.bottom - rect.top + 'px';
			this.textInput.style.overflowY = 'auto';
		} else {
			this.textInput.style.overflowY = 'hidden';
		}

		this.updateBorderColor(rect, bounds);
	};

	private snapToGuideLines(x: number, y: number): [number, number] {
		if (!this.guides.enabled || !this.isCtrlPressedRef?.current) return [x, y];

		const projectWidth = this.logicalWidth;
		const projectHeight = this.logicalHeight;
		const gridW = projectWidth / this.guides.columns;
		const gridH = projectHeight / this.guides.rows;
		const tolerance = 30;

		const verticalLines = Array.from({ length: this.guides.columns + 1 }, (_, i) => i * gridW);
		const horizontalLines = Array.from({ length: this.guides.rows + 1 }, (_, i) => i * gridH);

		const findNearestLine = (pos: number, lines: number[]): number | null => {
			let nearest = null;
			let minDist = tolerance + 1;
			for (const line of lines) {
				const dist = Math.abs(pos - line);
				if (dist < minDist) {
					minDist = dist;
					nearest = line;
				}
			}
			return nearest;
		};

		const snappedX = findNearestLine(x, verticalLines) ?? x;
		const snappedY = findNearestLine(y, horizontalLines) ?? y;

		return [snappedX, snappedY];
	}

	private handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			this.commitText();
		} else if (e.key === 'Escape') {
			this.cancelEditing();
		}
	}

	private commitText() {
		if (!this.textInput || !this.pendingText) return;

		const text = this.textInput.value.trim();
		if (!text) {
			this.cleanup();
			return;
		}

		// const { x: logicalX, y: logicalY, fontSize, color } = this.pendingText;
		let { x, y } = this.pendingText;
		const { fontSize, color } = this.pendingText;
		const physicalX = x * this.dpr;
		const physicalY = y * this.dpr;
		const physicalFontSize = fontSize * this.dpr;
		const physicalMaxWidth = (this.logicalWidth - x - 10) * this.dpr;
		const physicalLineHeight = physicalFontSize * 1.2;

		[x, y] = this.snapToGuideLines(x, y);

		const tempCtx = this.ctx;
		if (!tempCtx) {
			this.cleanup();
			return;
		}

		const ctx = this.ctx;
		ctx.save();
		ctx.resetTransform();
		// tempCtx.save();

		ctx.font = `normal ${physicalFontSize}px Arial, sans-serif`;
		ctx.fillStyle = color;
		ctx.textBaseline = 'top';
		ctx.textAlign = 'left';
		// tempCtx.font = `${fontSize}px Arial, sans-serif`;
		// tempCtx.textBaseline = 'top';
		// tempCtx.textAlign = 'left';

		const lines = this.wrapTextPhysical(ctx, text, physicalMaxWidth);
		// const maxWidth = (this.logicalWidth - x - 10) * this.dpr;
		// const lines = this.wrapTextLogical(tempCtx, text, maxWidth);
		// const lineHeight = fontSize * 1.2;

		for (let i = 0; i < lines.length; i++) {
			const lineY = physicalY + i * physicalLineHeight;
			if (lineY > this.canvas.height) break;
			ctx.fillText(lines[i], physicalX, lineY);
			// let width = 0;
			// for (const line of lines) {
			// 	const w = tempCtx.measureText(line).width;
			// 	if (w > width) width = w;
		}
		// const height = lines.length * lineHeight;

		// const textObject: Text = {
		// 	id: generateId(),
		// 	type: 'text',
		// 	x: x,
		// 	y: y,
		// 	width,
		// 	height,
		// 	lines,
		// 	text,
		// 	fontSize,
		// 	fill: color,
		// 	layerId: this.layerId || 'default',
		// };

		// this.onComplete?.(textObject);

		// tempCtx.restore();
		ctx.restore();
		this.cleanup();
	}

	private wrapTextPhysical(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
		const lines: string[] = [];
		const paragraphs = text.split('\n');

		for (const paragraph of paragraphs) {
			if (!paragraph.trim()) {
				lines.push('');
				continue;
			}

			const words = paragraph.split(/\s+/);
			let currentLine = '';

			for (const word of words) {
				const testLine = currentLine ? `${currentLine} ${word}` : word;
				const width = ctx.measureText(testLine).width;

				if (width > maxWidth && currentLine === '') {
					const broken = this.breakLongWordPhysical(ctx, word, maxWidth);
					lines.push(...broken);
					continue;
				}

				if (width > maxWidth) {
					lines.push(currentLine);
					currentLine = word;
				} else {
					currentLine = testLine;
				}
			}

			if (currentLine) lines.push(currentLine);
		}

		return lines;
	}

	private breakLongWordPhysical(ctx: CanvasRenderingContext2D, word: string, maxWidth: number): string[] {
		const parts: string[] = [];
		let current = '';

		for (const char of word) {
			const test = current + char;
			if (ctx.measureText(test).width > maxWidth) {
				parts.push(current);
				// if (current) parts.push(current);
				current = char;
			} else {
				current = test;
			}
		}

		if (current) parts.push(current);
		return parts;
	}

	private cancelEditing = () => this.cleanup();

	private cleanup() {
		if (this.textInput) {
			this.textInput.style.display = 'none';
			this.textInput.value = '';
			this.textInput.style.overflowY = 'hidden';
		}
		this.isEditing = false;
		this.pendingText = null;
		this.isTextEditingRef.current = false;
	}

	applyStyles(styles: Styles) {
		super.applyStyles(styles);
		if (this.textInput && this.isEditing) {
			this.textInput.style.fontSize = styles.fontSize + 'px';
			this.textInput.style.color = styles.fill;
			this.adjustTextareaHeight();
		}
	}

	destroyEvents() {
		super.destroyEvents();
		this.canvas.onclick = null;

		if (this.textInput) {
			this.textInput.removeEventListener('keydown', this.handleKeyDown.bind(this));
			this.textInput.removeEventListener('blur', this.cancelEditing.bind(this));
			this.textInput.removeEventListener('input', this.adjustTextareaHeight.bind(this));
			this.textInput.remove();
			this.textInput = null;
		}

		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
	}
}
