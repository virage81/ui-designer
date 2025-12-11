import { createAction, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '@shared/helpers';
import type { ProjectsSliceState } from '@shared/types/projectsSliceState';
import type { AddToHistoryParams, Project, SaveHistorySnapshotParams, SetHistoryActivityParams, SetHistoryParams, UndoRedoHistoryParams } from '@shared/types/project';
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
				zIndex: 1,
			};

			state.layers[id] = [layer];
			state.activeLayer = layer;
			state.zoom = initialState.zoom;

			// Инициализируем историю для проекта и начального слоя
			state.history[id] = {
				history: [{
					layers: [...state.layers[id]],
					type: HISTORY_ACTIONS.LAYER_ADD,
					id: 0,
					date: new Date().getTime(),
					activeLayer: layer,
				}],
				// pointer - общий указатель для истории;
				pointer: 0,
				/**
				 * active - состояние активности истории
				 * для включения рисования из истории
				 */
				active: false,
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

			if (!state.layers[action.payload.id]) throw new Error('There is no layers to delete');
			delete state.layers[action.payload.id];

			if (!state.history[action.payload.id]) throw new Error('There is no history to delete');
			delete state.history[action.payload.id];
		},

		createLayer: (state, action: PayloadAction<CreateLayerParams>) => {
			const { projectId, data, activeLayer } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const layerId = generateId();
			state.layers[projectId].push({ ...data, id: layerId });

			/**
			 * Тут действия с историей.
			 *
			 * Если длина истории больше указателя
			 * и добавляем новый элемент истории -> значит,
			 * нужно удалить неактивные элементы истории.
			 *
			 * То есть это кейс, когда мы сделали 10 действий,
			 * отменили 5 действий и сделали новое действие ->
			 * теперь у нас 6 действий, а старые 5 не нужны
			 */
			const pointer = state.history[projectId].pointer;
			if (state.history[projectId].history.length - 1 > pointer) {
				const diff = state.history[projectId].history.length - pointer;
				state.history[projectId].history.splice(pointer + 1, diff);
			}

			const newPointer = ++state.history[projectId].pointer;
			state.history[projectId].history[newPointer] = {
				layers: [...state.layers[projectId]],
				type: HISTORY_ACTIONS.LAYER_ADD,
				id: newPointer,
				date: new Date().getTime(),
				activeLayer: activeLayer
			}
		},

		updateLayer: (state, action: PayloadAction<UpdateLayerParams>) => {
			const { data, projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const layerIndex = state.layers?.[projectId]?.findIndex(item => item.id === data.id);
			if (layerIndex === -1 || layerIndex === undefined) throw new Error(`Layer with ID ${data.id} not found`);

			state.layers[projectId][layerIndex] = { ...state.layers[projectId][layerIndex], ...data };

			const layer = state.layers[projectId][layerIndex];

			/**
			 * Тут делаем изменяемый слой активным
			 * в случае, если он неактивен
			 */
			if (state.activeLayer?.id !== layer.id) {
				state.activeLayer = layer;

				/**
				 * Тут действия с историей.
				 * Увеличиваем указатель на шаг
				 */
				const newPointer = ++state.history[projectId].pointer;
				// и добавляем новый элемент в историю
				state.history[projectId].history[newPointer] = {
					layers: [...state.layers[projectId]],
					type: HISTORY_ACTIONS.LAYER_ACTIVE,
					id: newPointer,
					date: new Date().getTime(),
					activeLayer: layer,
				};
			}
			// Устанавливаем активность истории для перерисовки
			state.history[projectId].active = true;
		},

		deleteLayer: (state, action: PayloadAction<DeleteLayerParams>) => {
			const { id, projectId, activeLayer } = action.payload;

			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);
			if (state.layers[projectId].length === 1) throw new Error('Cannot delete the last remaining layer');

			const layerIndex = state.layers?.[projectId]?.findIndex(item => item.id === id);
			if (layerIndex === -1 || layerIndex === undefined) throw new Error(`Layer with ID ${id} not found`);

			/**
			 * Тут действия с историей.
			 *
			 * Если длина истории больше указателя
			 * и добавляем новый элемент истории -> значит,
			 * нужно удалить неактивные элементы истории.
			 *
			 * То есть это кейс, когда мы сделали 10 действий,
			 * отменили 5 действий и сделали новое действие ->
			 * теперь у нас 6 действий, а старые 5 не нужны
			 */
			const pointer = state.history[projectId].pointer;
			if (state.history[projectId].history.length - 1 > pointer) {
				const diff = state.history[projectId].history.length - pointer;
				state.history[projectId].history.splice(pointer + 1, diff);
			}

			// Тут теперь задаётся активный слой после удаления
			let newActiveLayer = null;
			if (id !== activeLayer?.id) {
				newActiveLayer = activeLayer;
			}

			if (id === activeLayer?.id && state.layers[projectId][layerIndex + 1]?.id) {
				newActiveLayer = state.layers[projectId][layerIndex + 1];
			} else if (id === activeLayer?.id && state.layers[projectId][layerIndex - 1]?.id) {
				newActiveLayer = state.layers[projectId][layerIndex - 1];
			}

			state.layers[projectId].splice(layerIndex, 1);

			const newPointer = ++state.history[projectId].pointer;
			state.history[projectId].history[newPointer] = {
				layers: [...state.layers[projectId]],
				type: HISTORY_ACTIONS.LAYER_DELETE,
				id: newPointer,
				date: new Date().getTime(),
				activeLayer: newActiveLayer,
			}

			state.activeLayer = newActiveLayer;
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

			/**
			* Тут действия с историей.
			* Увеличиваем указатель на шаг
			*/
			const newPointer = ++state.history[payload.projectId].pointer;
			// и добавляем новый элемент в историю
			state.history[payload.projectId].history[newPointer] = {
				layers: [...state.layers[payload.projectId]],
				type: HISTORY_ACTIONS.LAYER_ACTIVE,
				id: newPointer,
				date: new Date().getTime(),
				activeLayer: state.layers[payload.projectId][layerIndex],
			};
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

			state.layers[payload.projectId][layerIndex].canvasData = undefined;
			state.activeLayer = state.layers[payload.projectId][layerIndex];

			/**
			 * Тут действия с историей.
			 * Увеличиваем указатель на шаг
			 */
			const newPointer = ++state.history[payload.projectId].pointer;
			// и добавляем новый элемент в историю
			state.history[payload.projectId].history[newPointer] = {
				layers: [...state.layers[payload.projectId]],
				type: HISTORY_ACTIONS.LAYER_CLEAR,
				id: newPointer,
				date: new Date().getTime(),
				activeLayer: state.layers[payload.projectId][layerIndex],
			}
			state.history[payload.projectId].active = true;
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
			const { projectId, type, activeLayer } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const pointer = state.history[projectId].pointer;

			if (state.history[projectId].history.length - 1 > pointer) {
				const diff = state.history[projectId].history.length - pointer;
				state.history[projectId].history.splice(pointer + 1, diff);
			}

			state.history[projectId].active = false;

			// Тут увеличиваем указатель на шаг
			const newPointer = ++state.history[projectId].pointer;
			// и добавляем новый элемент в историю
			state.history[projectId].history[newPointer] = {
				layers: [...state.layers[projectId]],
				type,
				id: newPointer,
				date: new Date().getTime(),
				activeLayer,
			}
		},

		// Тут отменяем историю на шаг
		undoHistory: (state, action: PayloadAction<UndoRedoHistoryParams>) => {
			const { projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const pointer = --state.history[projectId].pointer;
			state.layers[projectId] = [...state.history[projectId].history[pointer].layers];

			// Устанавливаем активный слой из истории
			if (state.history[projectId].history[pointer].activeLayer) {
				state.activeLayer = state.history[projectId].history[pointer].activeLayer;
			}

			// Устанавливаем активность истории для перерисовки
			state.history[projectId].active = true;
		},

		// Тут возвращаем историю на шаг
		redoHistory: (state, action: PayloadAction<UndoRedoHistoryParams>) => {
			const { projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const pointer = ++state.history[projectId].pointer;
			state.layers[projectId] = [...state.history[projectId].history[pointer].layers];

			// Устанавливаем активный слой из истории
			if (state.history[projectId].history[pointer].activeLayer) {
				state.activeLayer = state.history[projectId].history[pointer].activeLayer;
			}

			// Устанавливаем активность истории для перерисовки
			state.history[projectId].active = true;
		},

		// Тут выставляем историю при клике на список истории
		setHistory: (state, action: PayloadAction<SetHistoryParams>) => {
			const { projectId, id } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			if (id === undefined) throw new Error(`History with ID ${id} does not exist`);

			// Устанавливаем активность истории для перерисовки
			state.history[projectId].active = true;

			if (id === 0) {
				state.history[projectId].pointer = id;
				state.layers[projectId] = [...state.history[projectId].history[id].layers];

				// Устанавливаем активный слой из истории
				if (state.history[projectId].history[id].activeLayer) {
					state.activeLayer = state.history[projectId].history[id].activeLayer;
				}

				return;
			}

			/**
			 * Если кликнули на активный элемент истории,
			 * выставляем указатель на этот элемент минус 1
			 * для того, чтобы сделать кликнутый элемент
			 * и все элементы после него (после = позже)
			 * неактивными
			 */
			if (id <= state.history[projectId].pointer) {
				state.history[projectId].pointer = id - 1;
				const pointer = state.history[projectId].pointer;
				state.layers[projectId] = [...state.history[projectId].history[pointer].layers];

				// Устанавливаем активный слой из истории
				if (state.history[projectId].history[pointer].activeLayer) {
					state.activeLayer = state.history[projectId].history[pointer].activeLayer;
				}

				return;
			}

			/**
			 * Если кликнули на неактивный элемент истории,
			 * активируем (возвращаем) все элементы включая
			 * тот, на который кликнули
			 */
			if (id > state.history[projectId].pointer) {
				state.history[projectId].pointer = id;
				state.layers[projectId] = [...state.history[projectId].history[id].layers];

				// Устанавливаем активный слой из истории
				if (state.history[projectId].history[id].activeLayer) {
					state.activeLayer = state.history[projectId].history[id].activeLayer;
				}
			}
		},

		// Тут выставляем активность истории
		setHistoryActivity: (state, action: PayloadAction<SetHistoryActivityParams>) => {
			const { projectId, status } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			state.history[projectId].active = status;
		}
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

export const isUndoActiveSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;
	const pointer = history[projectId].pointer;

	return pointer >= 1;
}

export const isRedoActiveSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;
	const pointer = history[projectId].pointer;

	return pointer < history[projectId].history.length - 1;
}

export const pointerSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;

	return history[projectId].pointer;
};

export const isHistoryActiveSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;

	return history[projectId].active;
};

export const historyElTypeSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;
	const pointer = history[projectId].pointer;

	return history[projectId].history[pointer].type;
};

export const nextHistoryElTypeSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;
	const pointer = history[projectId].pointer;

	return history[projectId].history[pointer + 1]?.type;
};

export const historySelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;

	return [...history[projectId].history];
};

export const layersSelector = (state: RootState, projectId: Project['id']) => {
	const { layers } = state.projects;

	return [...layers[projectId]];
}

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
	setHistoryActivity,
} = projectsSlice.actions;

export default projectsSlice.reducer;
