import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Layer } from '@shared/types/project';
import { addToHistory } from '@store/slices/projectsSlice';
import type { HISTORY_ACTIONS } from '@store/slices/projectsSlice.enums';
import type { ACTIONS } from '@store/slices/toolsSlice';

interface CaptureCanvasParams {
	projectId: string;
	activeLayer: Layer;
	canvasRef: HTMLCanvasElement | null;
	type: HISTORY_ACTIONS | ACTIONS;
}

/**
 * это middleware для слайса - внутри сохранение изображения слоя
 * в строку и в параметр canvasDataURL
 */
export const captureCanvasAndSaveToHistory = createAsyncThunk<void, CaptureCanvasParams>(
	'projects/captureCanvasAndSave',
	async (
		{ projectId, activeLayer, canvasRef, type }, { dispatch }
	) => {
		let dataURL = '';
		if (canvasRef) {
			dataURL = canvasRef.toDataURL('image/png', 1);
		}

		dispatch(
			addToHistory({
				projectId: projectId,
				activeLayer,
				type,
				canvasDataURL: dataURL,
			}),
		);
	}
);
