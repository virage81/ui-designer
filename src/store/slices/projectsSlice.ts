import { createAction, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '@shared/helpers';
import type { ProjectsSliceState } from '@shared/types/projectsSliceState';
import type { AddToHistoryPayload, Project, SaveHistorySnapshotParams, SetHistoryParams, UndoRedoHistoryParams } from '@shared/types/project';
import { checkProjectExistence } from '@store/utils/projects';
import type { RootState } from '..';
import type {
	ClearActiveLayer,
	CreateLayerParams,
	CreateProjectParams,
	DeleteLayerParams,
	DeleteProjectParams,
	SetActiveLayerParams,
	UpdateLayerParams,
	UpdateProjectParams,
} from './projectSlice.types';
import { HISTORY_ACTIONS } from './projectsSlice.enums';

const initialState: ProjectsSliceState = {
	projects: [],
	history: {},
	layers: {},
	activeLayer: null,
};

const projectsSlice = createSlice({
	name: 'projects',
	initialState,
	reducers: {
		createProject: (state, action: PayloadAction<CreateProjectParams>) => {
			const projectId = generateId();

			state.projects.push({ ...action.payload, id: projectId, preview: '', date: new Date().toISOString() });
			const layer = { id: generateId(), hidden: false, name: 'Фон', opacity: 100, zIndex: 1 };
			state.layers[projectId] = [layer];
			state.activeLayer = layer;
			state.history[projectId] = {
				history: [{
					layers: [...state.layers[projectId]],
					type: HISTORY_ACTIONS.LAYER_ADD,
					id: 0,
					date: new Date().toUTCString()
				}],
				pointer: 0,
			};
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

			state.layers[projectId].push({ ...data, id: generateId() });
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
			if (state.layers[projectId].length === 1) throw new Error('Cannot delete the last remaining layer');

			const layerIndex = state.layers?.[projectId]?.findIndex(item => item.id === id);
			if (layerIndex === -1 || layerIndex === undefined) throw new Error(`Layer with ID ${id} not found`);

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

			state.layers[payload.projectId][layerIndex].canvasDataURL = '';
			state.activeLayer = state.layers[payload.projectId][layerIndex];
		},
	},

	extraReducers: (builder) => {
		builder.addCase(addToHistory, (state, action) => {
			const { projectId, type } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const pointer = state.history[projectId].pointer;

			if (state.history[projectId].history.length - 1 > pointer) {
				const diff = state.history[projectId].history.length - pointer;
				state.history[projectId].history.splice(pointer + 1, diff);
			}

			const newPointer = ++state.history[projectId].pointer;
			state.history[projectId].history[newPointer] = {
				layers: [...state.layers[projectId]],
				type,
				id: newPointer,
				date: new Date().toUTCString()
			}
		});

		builder.addCase(undoHistory, (state, action) => {
			const { projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const pointer = --state.history[projectId].pointer;
			state.layers[projectId] = state.history[projectId].history[pointer].layers;
		});

		builder.addCase(redoHistory, (state, action) => {
			const { projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const pointer = ++state.history[projectId].pointer;
			state.layers[projectId] = state.history[projectId].history[pointer].layers;
		});

		builder.addCase(setHistory, (state, action) => {
			const { projectId, pointer } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);
			if (pointer < 0) throw new Error(`Pointer can't be lower than 0. Pointer is ${pointer}`);

			if (pointer <= state.history[projectId].pointer) {
				state.history[projectId].pointer = pointer - 1;
				const newPointer = state.history[projectId].pointer;
				state.layers[projectId] = [...state.history[projectId].history[newPointer].layers];

				return;
			}

			if (pointer > state.history[projectId].pointer) {
				state.history[projectId].pointer = pointer;
				state.layers[projectId] = state.history[projectId].history[pointer].layers;
			}
		});

		builder.addCase(saveHistorySnapshot, (state, action) => {
			const { projectId, layerId, canvasDataURL } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const pointer = state.history[projectId].pointer;
			const layers = state.history[projectId].history[pointer].layers;
			const layer = layers.find(l => l.id === layerId);

			if (!layer) return;

			layer.canvasDataURL = canvasDataURL;
		});
	},
});

export const addToHistory = createAction<AddToHistoryPayload>('history/addToHistory');
export const undoHistory = createAction<UndoRedoHistoryParams>('history/undoHistory');
export const redoHistory = createAction<UndoRedoHistoryParams>('history/redoHistory');
export const setHistory = createAction<SetHistoryParams>('history/setHistory');
export const saveHistorySnapshot = createAction<SaveHistorySnapshotParams>('history/saveHistorySnapshot');

export const sortedLayersSelector = createSelector(
	[(state: RootState) => state.projects.layers, (_, projectId: string) => projectId],
	(layers = {}, projectId) => {
		return [...layers[projectId]].sort((a, b) => b.zIndex - a.zIndex);
	},
);

export const isUndoActiveSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;
	const pointer = history[projectId].pointer;

	return pointer > 0 ? true : false;
}

export const isRedoActiveSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;
	const pointer = history[projectId].pointer;

	return pointer <= history[projectId].history.length - 2 ? true : false;
}

export const pointerSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;

	return history[projectId].pointer;
};

export const historySelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;

	return [...history[projectId].history];
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
} = projectsSlice.actions;

export default projectsSlice.reducer;
