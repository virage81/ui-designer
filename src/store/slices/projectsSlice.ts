import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '@shared/helpers';
import type { History, Layer, Project } from '@shared/types/project';
import type { RootState } from '..';
import type {
	CreateLayerParams,
	CreateProjectParams,
	DeleteLayerParams,
	DeleteProjectParams,
	SetActiveLayerParams,
	UpdateLayerParams,
	UpdateProjectParams,
} from './projectSlice.types';

interface State {
	projects: Project[];
	history: Record<Project['id'], History[]>;
	layers: Record<Project['id'], Layer[]>;
	activeLayer: Layer | null;
}

const checkProjectExistence = (state: State, projectId: Project['id']) => {
	return state.projects.some(item => item.id === projectId);
};

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
		createProject: (state, action: PayloadAction<CreateProjectParams>) => {
			const id = generateId();

			state.projects.push({ ...action.payload, id, preview: '', date: new Date().toISOString() });
			state.history[id] = [];
			state.layers[id] = [{ id: generateId(), hidden: false, isBase: true, name: 'Фон', opacity: 100, zIndex: 1 }];
		},
		updateProject: (state, action: PayloadAction<UpdateProjectParams>) => {
			const projectIndex = state.projects.findIndex(item => item.id === action.payload.id);
			if (projectIndex === -1) throw new Error(`Project with ID ${action.payload.id} not found`);

			state.projects[projectIndex] = { ...state.projects[projectIndex], ...action.payload };
		},
		deleteProject: (state, action: PayloadAction<DeleteProjectParams>) => {
			const projectIndex = state.projects.findIndex(item => item.id === action.payload.id);
			if (projectIndex === -1) throw new Error(`Project with ID ${action.payload.id} not found`);

			state.projects.splice(projectIndex, 1);
		},

		createLayer: (state, action: PayloadAction<CreateLayerParams>) => {
			const { projectId, data } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			state.layers[projectId].push({ ...data, id: generateId(), isBase: false });
		},
		updateLayer: (state, action: PayloadAction<UpdateLayerParams>) => {
			const { data, projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const layerIndex = state.layers?.[projectId]?.findIndex(item => item.id === data.id);
			if (layerIndex === -1 || layerIndex === undefined) throw new Error(`Layer with ID ${data.id} not found`);

			state.layers[projectId][layerIndex] = { ...state.layers[projectId][layerIndex], ...data };
		},
		deleteLayer: (state, action: PayloadAction<DeleteLayerParams>) => {
			const { id, projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const layerIndex = state.layers?.[projectId]?.findIndex(item => item.id === id);
			if (layerIndex === -1 || layerIndex === undefined) throw new Error(`Layer with ID ${id} not found`);

			if (state.layers[projectId][layerIndex].isBase) throw new Error('Cannot delete base layer');

			state.layers[projectId].splice(layerIndex, 1);
		},
		setActiveLayer: (state, action: PayloadAction<SetActiveLayerParams>) => {
			const { payload } = action;

			if (!payload) {
				state.activeLayer = payload;
				return;
			}

			if (!checkProjectExistence(state, payload.projectId))
				throw new Error(`Project with ID ${payload.projectId} does not exist`);

			const layerIndex = state.layers?.[payload.projectId]?.findIndex(item => item.id === payload.id);
			if (layerIndex === -1 || layerIndex === undefined) throw new Error(`Layer with ID ${payload.id} not found`);

			state.activeLayer = state.layers[payload.projectId][layerIndex];
		},
	},
});

export const sortedLayersSelector = (state: RootState, projectId: Project['id']) => {
	const { layers } = state.projects;

	return [...layers[projectId]].sort((a, b) => {
		if (a.isBase && !b.isBase) return 1;
		if (!a.isBase && b.isBase) return -1;

		return b.zIndex - a.zIndex;
	});
};

export const { createProject, updateProject, deleteProject, createLayer, updateLayer, deleteLayer, setActiveLayer } =
	projectsSlice.actions;

export default projectsSlice.reducer;
