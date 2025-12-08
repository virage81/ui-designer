import { createAction, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '@shared/helpers';
import type { ProjectsSliceState } from '@shared/types/projectsSliceState';
import type { AddToHistoryParams, Layer, Project, SaveHistorySnapshotParams, SetHistoryParams, UndoRedoHistoryParams } from '@shared/types/project';
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

const initialState: ProjectsSliceState = {
	projects: [],
	history: {},
	layers: {},
	activeLayer: null,
	zoom: 1,
	guides: { enabled: false, columns: 1, rows: 1 },
};

const projectsSlice = createSlice({
	name: 'projects',
	initialState,
	reducers: {
		createProject: (state, action: PayloadAction<CreateProjectParams>) => {
			const id = generateId();
			const layerId = generateId();

			state.projects.push({
				...action.payload,
				id,
				preview: '',
				date: new Date().getTime()
			});

			const layer = {
				id: layerId,
				hidden: false,
				name: 'Фон',
				opacity: 100,
				zIndex: 1
			};

			state.layers[id] = [layer];
			state.activeLayer = layer;

			// Инициализируем объект истории для проекта и слоя
			if (!state.history[id]) {
				state.history[id] = {};
			}
			state.history[id][layerId] = {
				history: [],
				/**
				 * pointer - общий указатель для истории;
				 * начнём с -1 - это означает, что истории нет
					*/
				pointer: -1
			};
		},

		updateProject: (state, action: PayloadAction<UpdateProjectParams>) => {
			const projectIndex = state.projects.findIndex(item => item.id === action.payload.id);
			if (projectIndex === -1) throw new Error(`Project with ID ${action.payload.id} not found`);

			state.projects[projectIndex] = { ...state.projects[projectIndex], ...action.payload, date: new Date().getTime() };
		},

		deleteProject: (state, action: PayloadAction<DeleteProjectParams>) => {
			const projectIndex = state.projects.findIndex(item => item.id === action.payload.id);
			if (projectIndex === -1) throw new Error(`Project with ID ${action.payload.id} not found`);

			state.projects.splice(projectIndex, 1);
		},

		createLayer: (state, action: PayloadAction<CreateLayerParams>) => {
			const { projectId, data } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const layerId = generateId();
			state.layers[projectId].push({ ...data, id: layerId });

			state.history[projectId][layerId] = {
				history: [],
				pointer: -1
			};
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
			state.layers[payload.projectId][layerIndex].canvasData = undefined;
			state.activeLayer = state.layers[payload.projectId][layerIndex];
		},

		setZoom: (state, action: PayloadAction<number>) => {
			state.zoom = action.payload;
		},

		enableGuides: (state, action: PayloadAction<boolean>) => {
			if (!state.guides) {
				state.guides = { enabled: false, columns: 1, rows: 1 };
			}
			state.guides.enabled = action.payload;
		},

		setGuidesColumns: (state, action: PayloadAction<number>) => {
			if (!state.guides) {
				state.guides = { enabled: false, columns: 1, rows: 1 };
			}
			state.guides.columns = action.payload;
		},

		setGuidesRows: (state, action: PayloadAction<number>) => {
			if (!state.guides) {
				state.guides = { enabled: false, columns: 1, rows: 1 };
			}
			state.guides.rows = action.payload;
		},

		// Тут добавляем события в историю
		addToHistory: (state, action: PayloadAction<AddToHistoryParams>) => {
			const { projectId, type, layerId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const historyState = state.history[projectId]?.[layerId];

			if (!historyState) return;

			/**
			 * Если были отменена история (pointer < history.length - 1),
			 * обрезаем "будущую" историю
			 */
			if (historyState.pointer < historyState.history.length - 1) {
				historyState.history = historyState.history.slice(0, historyState.pointer + 1);
			}

			// Добавляем историю
			historyState.history.push(({
				type,
				id: historyState.history.length,
				date: new Date().toUTCString(),
				canvasData: '',
			}));

			// Сдвигаем указатель
			historyState.pointer = historyState.history.length - 1;
		},

		// Тут отменяем историю на шаг
		undoHistory: (state, action: PayloadAction<UndoRedoHistoryParams>) => {
			const { projectId, layerId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const historyState = state.history[projectId]?.[layerId];
			if (!historyState || historyState.pointer <= -1) throw new Error(`Can't undo`);

			const step = 1;
			historyState.pointer -= step;
		},

		// Тут возвращаем историю на шаг
		redoHistory: (state, action: PayloadAction<UndoRedoHistoryParams>) => {
			const { projectId, layerId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const historyState = state.history[projectId]?.[layerId];
			if (!historyState || historyState.pointer >= historyState.history.length - 1) throw new Error(`Can't redo`);

			const step = 1;
			historyState.pointer += step;
		},

		// Тут выставляем историю при клике на список истори
		setHistory: (state, action: PayloadAction<SetHistoryParams>) => {
			const { projectId, layerId, index } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const historyState = state.history[projectId]?.[layerId];
			if (!historyState || index < -1 || index >= historyState.history.length) throw new Error(`Can't set history`);

			/**
			 * Если кликнули на активный элемент истории,
			 * выставляем указатель на этот элемент минус 1
			 * для того, чтобы сделать кликнутый элемент
			 * и все элементы после него (после = позже)
			 * неактивными
			 */
			if (index <= historyState.pointer) {
				historyState.pointer = index - 1;

				return;
			}

			/**
			 * Если кликнули на неактивный элемент истории,
			 * активируем (возвращаем) все элементы включая
			 * тот, на который кликнули
			 */
			if (index > historyState.pointer) {
				historyState.pointer = index;
			}

			historyState.pointer = index;
		}
	},

	extraReducers: (builder) => {
		// Тут сохраняем snapshot слоя
		builder.addCase(saveHistorySnapshot, (state, action) => {
			const { projectId, layerId, canvasDataURL } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const layers = state.layers[projectId];
			const layer = layers.find(l => l.id === layerId);

			if (!layer) return;

			layer.canvasDataURL = canvasDataURL;

			const historyState = state.history[projectId]?.[layerId];

			if (!historyState.history[historyState.pointer].id) return;
			historyState.history[historyState.pointer].canvasData = canvasDataURL;
		});
	},
});

export const saveHistorySnapshot = createAction<SaveHistorySnapshotParams>('history/saveHistorySnapshot');

export const sortedLayersSelector = createSelector(
	[(state: RootState) => state.projects.layers, (_, projectId: string) => projectId],
	(layers = {}, projectId) => {
		return [...layers[projectId]].sort((a, b) => b.zIndex - a.zIndex);
	},
);

export const selectProjectById = createSelector(
	(state: RootState) => state.projects.projects,
	(_: RootState, id: string) => id,
	(projects, id) => projects.find(p => p.id === id),
);

export const isUndoActiveSelector = (state: RootState, projectId: Project['id'], activeLayer: Layer | null) => {
	if (!activeLayer?.id) return false;

	const { history } = state.projects;
	const pointer = history[projectId][activeLayer.id]?.pointer;
	if (pointer === undefined) return false;

	return pointer >= -1;
}

export const isRedoActiveSelector = (state: RootState, projectId: Project['id'], activeLayer: Layer | null) => {
	if (!activeLayer?.id) return false;

	const { history } = state.projects;
	const pointer = history[projectId][activeLayer.id]?.pointer;
	if (pointer === undefined) return false;

	return pointer < history[projectId][activeLayer.id].history.length - 1;
}

export const pointerSelector = (state: RootState, projectId: Project['id'], activeLayer: Layer | null) => {
	if (!activeLayer?.id) return;

	const { history } = state.projects;
	const pointer = history[projectId][activeLayer.id]?.pointer;

	if (pointer === undefined) return;

	return history[projectId][activeLayer.id].pointer;
};

export const historySelector = (state: RootState, projectId: Project['id'], activeLayer: Layer | null) => {
	if (!activeLayer?.id) return;

	const { history } = state.projects;

	if (!history[projectId][activeLayer.id]?.history?.length) return;

	return [...history[projectId][activeLayer.id].history];
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
	setZoom,
	enableGuides,
	setGuidesColumns,
	setGuidesRows,
	addToHistory,
	undoHistory,
	redoHistory,
	setHistory,
} = projectsSlice.actions;

export default projectsSlice.reducer;
