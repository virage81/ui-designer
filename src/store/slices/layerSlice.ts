import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Layer } from '@shared/interfaces/layer.interface';
import { v4 as uuid } from 'uuid';
import type { RootState } from '..';

interface State {
	layers: Layer[];
	activeLayer: Layer | null;
}

type UpdateLayerParams = {
	id: Layer['id'];
	data: Partial<Omit<Layer, 'id'>>;
};

const initialState: State = {
	layers: [],
	activeLayer: null,
};

const layerSlice = createSlice({
	name: 'layer',
	initialState,
	reducers: {
		createLayer: (state, action: PayloadAction<Omit<Layer, 'id'>>) => {
			state.layers.push({ ...action.payload, id: uuid() });
		},
		updateLayer: (state, action: PayloadAction<UpdateLayerParams>) => {
			const layer = state.layers.find(item => item.id === action.payload.id);
			const layerIndex = state.layers.findIndex(item => item.id === action.payload.id);

			if (!layer || layerIndex === -1) throw new Error(`Layer with ID ${action.payload.id} not found`);

			state.layers[layerIndex] = { ...layer, ...action.payload.data };
		},
		deleteLayer: (state, action: PayloadAction<Pick<Layer, 'id'>>) => {
			const layerIndex = state.layers.findIndex(item => item.id === action.payload.id);
			console.debug(
				state.layers.map(item => item.id),
				action.payload,
			);

			if (layerIndex === -1) throw new Error(`Layer with ID ${action.payload.id} not found`);
			state.layers.splice(layerIndex, 1);
		},
		setActiveLayer: (state, action: PayloadAction<Pick<Layer, 'id'> | null>) => {
			const { payload } = action;

			if (payload === null) {
				state.activeLayer = payload;
				return;
			}

			const layerIndex = state.layers.findIndex(item => item.id === payload.id);

			if (layerIndex === -1) throw new Error(`Layer with ID ${payload.id} not found`);

			state.activeLayer = state.layers[layerIndex];
		},
	},
});

export const { createLayer, updateLayer, deleteLayer, setActiveLayer } = layerSlice.actions;

export const activeLayersSelector = (state: RootState) => state.layers.layers.filter(item => !item.hidden);

export default layerSlice.reducer;
