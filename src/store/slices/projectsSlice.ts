import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { History, Layer, Project } from '@shared/types/project';
import { v4 as uuid } from 'uuid';

type CreateLayerParams = {
	projectId: Project['id'];
	data: Omit<Layer, 'id'>;
};

type UpdateLayerParams = {
	projectId: Project['id'];
	data: { id: Layer['id'] } & Partial<Omit<Layer, 'id'>>;
};

type DeleteLayerParams = {
	id: Layer['id'];
	projectId: Project['id'];
};

type SetActiveLayerParams = {
	id: Layer['id'];
	projectId: Project['id'];
} | null;

interface State {
	projects: Project[];
	history: Record<Project['id'], History[]>;
	layers: Record<Project['id'], Layer[]>;
	activeLayer: Layer | null;
}

const initialState: State = {
	projects: [],
	history: {},
	layers: {},
	activeLayer: null,
};

const projectsSlice = createSlice({
	name: 'projects',
	initialState: initialState,
	reducers: {
		createLayer: (state, action: PayloadAction<CreateLayerParams>) => {
			state.layers[action.payload.projectId].push({ ...action.payload.data, id: uuid() });
		},
		updateLayer: (state, action: PayloadAction<UpdateLayerParams>) => {
			const { data, projectId } = action.payload;
			const layer = state.layers[projectId].find(item => item.id === data.id);
			const layerIndex = state.layers[projectId].findIndex(item => item.id === data.id);

			if (!layer || layerIndex === -1) throw new Error(`Layer with ID ${data.id} not found`);

			state.layers[projectId][layerIndex] = { ...layer, ...data };
		},
		deleteLayer: (state, action: PayloadAction<DeleteLayerParams>) => {
			const { id, projectId } = action.payload;

			const layerIndex = state.layers[projectId].findIndex(item => item.id === id);

			if (layerIndex === -1) throw new Error(`Layer with ID ${id} not found`);
			state.layers[projectId].splice(layerIndex, 1);
		},
		setActiveLayer: (state, action: PayloadAction<SetActiveLayerParams>) => {
			const { payload } = action;

			if (!payload) {
				state.activeLayer = payload;
				return;
			}

			const layerIndex = state.layers[payload.projectId].findIndex(item => item.id === payload.id);

			if (layerIndex === -1) throw new Error(`Layer with ID ${payload.id} not found`);

			state.activeLayer = state.layers[payload.projectId][layerIndex];
		},
	},
});

export const { createLayer, updateLayer, deleteLayer, setActiveLayer } = projectsSlice.actions;

export default projectsSlice.reducer;
