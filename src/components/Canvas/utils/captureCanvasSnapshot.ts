import { createAsyncThunk } from '@reduxjs/toolkit';
import { saveHistorySnapshot } from '@store/slices/projectsSlice';

interface CaptureCanvasParams {
	projectId: string;
	layerId: string;
	canvasRef: HTMLCanvasElement | null;
}

/**
 * это middleware для слайса - внутри сохранение изображения слоя
 * в строку и в параметр слоя canvasDataURL
 */
export const captureCanvasAndSaveToHistory = createAsyncThunk<void, CaptureCanvasParams>(
	'projects/captureCanvasAndSave',
	async (
		{ projectId, layerId, canvasRef }, { dispatch }
	) => {
		let dataURL = '';
		if (canvasRef) {
			dataURL = canvasRef.toDataURL('image/png', 1);
		}

		dispatch(
			saveHistorySnapshot({
				projectId,
				layerId,
				canvasDataURL: dataURL,
			})
		);
	}
);
