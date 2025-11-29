import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '@shared/helpers';
import type { ProjectsSliceState } from '@shared/types/projectsSliceState';

import type { Project } from '@shared/types/project';
import { checkProjectExistence } from '@store/utils/projects';
import type { RootState } from '..';
import type {
	ClearActiveLayer,
	CreateLayerParams,
	CreateProjectParams,
	DeleteLayerParams,
	DeleteProjectParams,
	ModifyHistoryParams,
	SetActiveLayerParams,
	UpdateLayerParams,
	UpdateProjectParams,
} from './projectSlice.types';

const initialState: ProjectsSliceState = {
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
			const baseLayer = { id: generateId(), hidden: false, isBase: true, name: 'Фон', opacity: 100, zIndex: 1 };
			state.layers[id] = [baseLayer];
			state.activeLayer = baseLayer;
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
		clearActiveLayer: (state, action: PayloadAction<ClearActiveLayer>) => {
			const { payload } = action;

			if (!payload) {
				state.activeLayer = payload;
				return;
			}

			if (!checkProjectExistence(state, payload.projectId))
				throw new Error(`Project with ID ${payload.projectId} does not exist`);

			const layerIndex = state.layers?.[payload.projectId]?.findIndex(item => item.id === payload.layerId);
			if (layerIndex === -1 || layerIndex === undefined) throw new Error(`Layer with ID ${payload.layerId} not found`);

			state.layers[payload.projectId][layerIndex].cleared = true;
			state.activeLayer = state.layers[payload.projectId][layerIndex];
		},

		modifyHistory: (state, action: PayloadAction<ModifyHistoryParams>) => {
			const { projectId, data } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			state.history[projectId].unshift({ ...data, id: generateId() })
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

export const historySelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;

	return [...history[projectId]];
};

export const {
	createProject,
	updateProject,
	deleteProject,
	createLayer,
	updateLayer,
	deleteLayer,
	setActiveLayer,
	clearActiveLayer,
	modifyHistory
} = projectsSlice.actions;

export default projectsSlice.reducer;
