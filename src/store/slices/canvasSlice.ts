import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CanvasState, Drawable } from '@shared/types/canvas';
import type { RootState } from '..';

const initialState: CanvasState = {
	objects: [],
};

const canvasSlice = createSlice({
	name: 'canvas',
	initialState,
	reducers: {
		addObject: (state, action: PayloadAction<Drawable>) => {
			state.objects.push(action.payload);
		},

		updateObject: (state, action: PayloadAction<{ id: string; updates: Partial<Drawable> }>) => {
			const obj = state.objects.find(object => object.id === action.payload.id);
			if (obj) Object.assign(obj, action.payload.updates);
		},

		removeObject: (state, action: PayloadAction<string>) => {
			state.objects = state.objects.filter(object => object.id !== action.payload);
		},

		clearLayerCanvas: (state, action: PayloadAction<string>) => {
			state.objects = state.objects.filter(object => object.layerId !== action.payload);
		},

		clearCanvas: state => {
			state.objects = [];
		},
	},
});

export const objectsByLayerSelector = (state: RootState, layerId: string) =>
	state.canvas.objects.filter(obj => obj.layerId === layerId);

export const { addObject, updateObject, removeObject, clearLayerCanvas, clearCanvas } = canvasSlice.actions;

export default canvasSlice.reducer;
