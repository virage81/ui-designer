import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CanvasState, Drawable } from '@shared/types/canvas';
import type { RootState } from '..';
import type { Layer } from '@shared/types/project';

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

		removeInactiveLayerObjects: (state, action: PayloadAction<{ layers: Layer[] }>) => {
			const { layers } = action.payload;
			const layerIds = new Set(layers.map((l: Layer) => l.id));

			state.objects = state.objects.filter(o => {
				return !o.removed && layerIds.has(o.layerId);
			});
		},

		clearObjects: (state, action: PayloadAction<{ layerId: string, start: number, end: number }>) => {
			const { layerId, start, end } = action.payload;
			state.objects.forEach(o => {
				if (o.layerId === layerId && o.pointer >= end && o.pointer <= start) {
					o.removed = true;
				}
			})
		},

		restoreObjects: (state, action: PayloadAction<{ layerId: string, start: number, end: number }>) => {
			const { layerId, start, end } = action.payload;
			state.objects.forEach(o => {
				if (o.layerId === layerId && o.pointer >= end && o.pointer <= start) {
					o.removed = false;
				}
			})
		},

		clearLayerCanvas: (state, action: PayloadAction<string>) => {
			state.objects.forEach(o => {
				if (o.layerId === action.payload) {
					o.removed = true;
				}
			});
		},

		restoreLayerObjects: (state, action: PayloadAction<string>) => {
			state.objects.forEach(o => {
				if (o.layerId === action.payload) {
					o.removed = false;
				}
			});
		},

		clearCanvas: state => {
			state.objects = [];
		},
	},
});

export const objectsByLayerSelector = (state: RootState, layerId: string) =>
	state.canvas.objects.filter(obj => obj.layerId === layerId);

export const objectsByProjectSelector = (state: RootState, projectId: string) =>
	state.canvas.objects.filter(obj => obj.projectId === projectId);

export const {
	addObject,
	updateObject,
	removeObject,
	removeInactiveLayerObjects,
	clearObjects,
	restoreObjects,
	clearLayerCanvas,
	restoreLayerObjects,
	clearCanvas
} = canvasSlice.actions;

export default canvasSlice.reducer;
