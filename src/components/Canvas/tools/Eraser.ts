import { findObjectAtPointPrecise } from '@shared/utils/canvas-helpers';
import { Tool, type Styles, type ToolOptions } from './Tool';
import { redrawCanvas } from '../utils/redrawCanvas';
import { updateObject } from '@store/slices/canvasSlice';
import { store } from '@store/index';

/**
 * Инструмент Ластик
 */
export class EraserTool extends Tool {
	constructor(canvas: HTMLCanvasElement, styles: Styles, options: ToolOptions = {}, zoom: number) {
		super(canvas, styles, options, zoom);
		this.listen();
	}

	listen = () => {
		this.canvas.onpointerdown = this.mouseDownHandler.bind(this);
	};

	mouseDownHandler = (e: PointerEvent) => {
		if (!this.ctx || !this.onComplete || !this.layerObjects) return;

		const [x, y] = this.getMousePos(e);
		const hitObject = this.findObjectAt(x, y);

		if (hitObject) {
			this.onComplete({ id: hitObject.id });

			// @TODO: передать dispatch через конструктор
			store.dispatch(updateObject({
				id: hitObject.id,
				updates: { removed: true }
			}));

			redrawCanvas(
				this.canvas,
				this.layerObjects,
				this.pointer,
			);
		}
	};

	private findObjectAt(x: number, y: number) {
		return findObjectAtPointPrecise(this.layerObjects, x, y, { tolerance: 5 });
	}
}
