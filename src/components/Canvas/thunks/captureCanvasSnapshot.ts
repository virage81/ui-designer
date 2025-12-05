import { createAsyncThunk } from '@reduxjs/toolkit';
import { saveHistorySnapshot } from '@store/slices/projectsSlice';

interface CaptureCanvasParams {
	projectId: string;
	layerId: string;
	canvasRef: HTMLCanvasElement;
}

export const captureCanvasAndSaveToHistory = createAsyncThunk<void, CaptureCanvasParams>(
	'projects/captureCanvasAndSave',
	async (
		{ projectId, layerId, canvasRef }, { dispatch }
	) => {
		const dataURL = canvasRef.toDataURL('image/png', 1);

		dispatch(
			saveHistorySnapshot({
				projectId,
				layerId,
				canvasDataURL: dataURL,
			})
		);
	}
);
