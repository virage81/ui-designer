import { debounce } from '@shared/debounce';
import { Tool, type Styles } from './Tool';

/**
 * Инструмент Текст
 */
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
	private pendingText: {
		x: number;
		y: number;
		fontSize: number;
		color: string;
	} | null = null;
	private resizeObserver: ResizeObserver | null = null;

	constructor(canvas: HTMLCanvasElement, styles: Styles) {
		super(canvas, styles);
		this.createTextInput();
		this.listen();
	}

	listen = () => {
		this.canvas.onclick = this.clickHandler.bind(this);
	};

	clickHandler = (e: MouseEvent) => {
		if (this.isEditing) return;

		const rect = this.canvas.getBoundingClientRect();
		const canvasX = e.clientX - rect.left;
		const canvasY = e.clientY - rect.top;

		this.startTextInput(e.clientX, e.clientY, canvasX, canvasY);
	};

	private createTextInput() {
		if (this.textInput) return;

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

		document.body.appendChild(this.textInput);

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

	private startTextInput(clientX: number, clientY: number, canvasX: number, canvasY: number) {
		if (!this.ctx) return;

		this.isEditing = true;
		this.pendingText = {
			x: canvasX,
			y: canvasY,
			fontSize: this.fontSize,
			color: this.fill,
		};

		Object.assign(this.textInput!.style, {
			display: 'block',
			left: clientX + 'px',
			top: clientY + 'px',
			width: '200px',
			height: 'auto',
			minHeight: '1lh',
			fontSize: this.fontSize + 'px',
			color: this.fill,
		});

		this.textInput!.value = '';
		this.adjustTextareaHeight();

		requestAnimationFrame(() => {
			this.textInput?.focus();
		});
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

	private handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			this.commitText();
		} else if (e.key === 'Escape') {
			this.cancelEditing();
		}
	}

	private commitText() {
		if (!this.textInput || !this.pendingText || !this.ctx) return;

		const text = this.textInput.value.trim();
		if (!text) {
			this.cleanup();
			return;
		}

		const textareaRect = this.textInput.getBoundingClientRect();
		const canvasRect = this.canvas.getBoundingClientRect();

		const canvasX = textareaRect.left - canvasRect.left;
		const canvasY = textareaRect.top - canvasRect.top;

		const scaleX = this.canvas.width / canvasRect.width;
		const scaleY = this.canvas.height / canvasRect.height;

		const { fontSize, color } = this.pendingText;

		this.ctx.font = `${fontSize}px Arial`;
		this.ctx.fillStyle = color;
		this.ctx.textBaseline = 'top';
		this.ctx.textAlign = 'left';

		const realCanvasX = canvasX * scaleX;
		const realCanvasY = canvasY * scaleY;

		const maxWidth = this.canvas.width - realCanvasX - 10;

		const lineHeight = fontSize * 1.2;

		const lines = this.wrapText(text, maxWidth);

		for (let i = 0; i < lines.length; i++) {
			const lineY = realCanvasY + i * lineHeight;

			if (lineY + lineHeight > this.canvas.height) break;

			this.ctx.fillText(lines[i], realCanvasX, lineY);
		}

		this.cleanup();
	}

	private wrapText(text: string, maxWidth: number): string[] {
		if (!this.ctx) return [text];

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
				const width = this.ctx.measureText(testLine).width;

				if (width > maxWidth && currentLine === '') {
					const broken = this.breakLongWord(word, maxWidth);
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

	private breakLongWord(word: string, maxWidth: number): string[] {
		const parts: string[] = [];
		let current = '';

		for (const char of word) {
			const test = current + char;
			if (this.ctx!.measureText(test).width > maxWidth) {
				parts.push(current);
				current = char;
			} else {
				current = test;
			}
		}

		if (current) parts.push(current);
		return parts;
	}

	private cancelEditing = () => {
		this.cleanup();
	};

	private cleanup() {
		if (this.textInput) {
			this.textInput.style.display = 'none';
			this.textInput.value = '';
			this.textInput.style.overflowY = 'hidden';
		}
		this.isEditing = false;
		this.pendingText = null;
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
