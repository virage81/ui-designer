import { createAction, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '@shared/helpers';
import type { Drawable } from '@shared/types/canvas';
import type {
	AddToHistoryParams,
	ClearHistoryParams,
	Project,
	SaveHistorySnapshotParams,
	SetHistoryParams,
	UndoRedoHistoryParams,
} from '@shared/types/project';
import type { ProjectsSliceState } from '@shared/types/projectsSliceState';
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

	save: {
		lastPreviewSavedAt: null,
		lastSaveWasManual: false,
	},

	canvasObjects: [],
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
				date: new Date().getTime(),
			});

			const layer = {
				id: layerId,
				hidden: false,
				name: 'Фон',
				opacity: 100,
				zIndex: 1,
				canvasDataURL: '',
			};

			state.layers[id] = [layer];
			state.activeLayer = layer;
			state.zoom = initialState.zoom;

			// Инициализируем историю для проекта и начального слоя
			state.history[id] = {
				history: [
					{
						layers: [...state.layers[id]],
						objects: [...state.canvasObjects],
						type: HISTORY_ACTIONS.LAYER_ADD,
						id: 0,
						date: new Date().getTime(),
						activeLayer: layer,
					},
				],
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
				objects: [...state.canvasObjects],
				type: HISTORY_ACTIONS.LAYER_ADD,
				id: newPointer,
				date: new Date().getTime(),
				activeLayer: activeLayer,
			};
		},

		updateLayer: (state, action: PayloadAction<UpdateLayerParams>) => {
			const { data, projectId, canvasDataURL } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const layerIndex = state.layers?.[projectId]?.findIndex(item => item.id === data.id);
			if (layerIndex === -1 || layerIndex === undefined) throw new Error(`Layer with ID ${data.id} not found`);

			state.layers[projectId][layerIndex] = { ...state.layers[projectId][layerIndex], ...data };

			const layer = state.layers[projectId][layerIndex];

			if (layer && canvasDataURL) {
				layer.canvasDataURL = canvasDataURL;
			}
			if (state.activeLayer && canvasDataURL) {
				state.activeLayer.canvasData = canvasDataURL;
			}

			/**
			 * Тут делаем изменяемый слой активным
			 * в случае, если он неактивен
			 */
			// if (state.activeLayer?.id !== layer.id) {
			// 	state.activeLayer = layer;

			// 	/**
			// 	 * Тут действия с историей.
			// 	 * Увеличиваем указатель на шаг
			// 	 */
			// 	const newPointer = ++state.history[projectId].pointer;
			// 	// и добавляем новый элемент в историю
			// 	state.history[projectId].history[newPointer] = {
			// 		layers: [...state.layers[projectId]],
			// 		objects: [...state.canvasObjects],
			// 		type: HISTORY_ACTIONS.LAYER_ACTIVE,
			// 		id: newPointer,
			// 		date: new Date().getTime(),
			// 		activeLayer: layer,
			// 	};
			// }
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

			state.canvasObjects = state.canvasObjects.filter(object => object.layerId !== id);

			const newPointer = ++state.history[projectId].pointer;
			// и добавляем новый элемент в историю
			state.history[projectId].history[newPointer] = {
				layers: [...state.layers[projectId]],
				objects: [...state.canvasObjects],
				type: HISTORY_ACTIONS.LAYER_DELETE,
				id: newPointer,
				date: new Date().getTime(),
				activeLayer: newActiveLayer,
			};

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

			const nextActiveLayer = state.layers[payload.projectId][layerIndex];

			if (state.activeLayer?.id === nextActiveLayer.id) {
				return;
			}

			state.activeLayer = nextActiveLayer;

			/**
			 * Тут действия с историей.
			 * Увеличиваем указатель на шаг
			 */
			const newPointer = ++state.history[payload.projectId].pointer;
			// и добавляем новый элемент в историю
			state.history[payload.projectId].history[newPointer] = {
				layers: [...state.layers[payload.projectId]],
				objects: [...state.canvasObjects],
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

			state.layers[payload.projectId][layerIndex].canvasDataURL = '';
			state.layers[payload.projectId][layerIndex].canvasData = undefined;
			state.activeLayer = state.layers[payload.projectId][layerIndex];
			state.canvasObjects = state.canvasObjects.filter(object => object.layerId !== payload.layerId);

			/**
			 * Тут действия с историей.
			 * Увеличиваем указатель на шаг
			 */
			const newPointer = ++state.history[payload.projectId].pointer;
			// и добавляем новый элемент в историю
			state.history[payload.projectId].history[newPointer] = {
				layers: [...state.layers[payload.projectId]],
				objects: [...state.canvasObjects],
				type: HISTORY_ACTIONS.LAYER_CLEAR,
				id: newPointer,
				date: new Date().getTime(),
				activeLayer: state.layers[payload.projectId][layerIndex],
			};

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
			const { projectId, type, activeLayer, canvasDataURL } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const pointer = state.history[projectId].pointer;

			if (state.history[projectId].history.length - 1 > pointer) {
				const diff = state.history[projectId].history.length - pointer;
				state.history[projectId].history.splice(pointer + 1, diff);
			}

			// Тут действия с историей
			const layers = state.layers[projectId];
			const layer = layers.find(l => l.id === activeLayer.id);

			if (layer && canvasDataURL) {
				layer.canvasDataURL = canvasDataURL;
			}

			if (state.activeLayer && canvasDataURL) {
				state.activeLayer.canvasData = canvasDataURL;
			}

			// Тут увеличиваем указатель на шаг
			const newPointer = ++state.history[projectId].pointer;
			// и добавляем новый элемент в историю
			state.history[projectId].history[newPointer] = {
				layers: [...state.layers[projectId]],
				objects: [...state.canvasObjects],
				type,
				id: newPointer,
				date: new Date().getTime(),
				activeLayer,
			};

			// Тут задаётся лимит истории
			// const history = state.history[projectId].history;
			// const historyLimit = 16;

			// if (history.length > historyLimit) {
			// 	const limitedHistory = history.slice(-historyLimit);
			// 	state.history[projectId].history = limitedHistory;
			// 	limitedHistory.forEach((h, index) => (h.id = index));

			// 	state.history[projectId].pointer = state.history[projectId].history.length - 1;
			// 	state.history[projectId].sliced = true;
			// }

			// Устанавливаем активность истории для перерисовки
			state.history[projectId].active = false;
		},

		// Тут отменяем историю на шаг
		undoHistory: (state, action: PayloadAction<UndoRedoHistoryParams>) => {
			const { projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const pointer = --state.history[projectId].pointer;
			state.layers[projectId] = [...state.history[projectId].history[pointer].layers];

			if (state.history[projectId].history[pointer].objects) {
				state.canvasObjects = [...state.history[projectId].history[pointer].objects];
			}

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

			if (state.history[projectId].history[pointer].objects) {
				state.canvasObjects = [...state.history[projectId].history[pointer].objects];
			}

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

				if (state.history[projectId].history[id].objects) {
					state.canvasObjects = [...state.history[projectId].history[id].objects];
				}

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

				if (state.history[projectId].history[pointer].objects) {
					state.canvasObjects = [...state.history[projectId].history[pointer].objects];
				}

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

				if (state.history[projectId].history[id].objects) {
					state.canvasObjects = [...state.history[projectId].history[id].objects];
				}

				// Устанавливаем активный слой из истории
				if (state.history[projectId].history[id].activeLayer) {
					state.activeLayer = state.history[projectId].history[id].activeLayer;
				}
			}
		},

		clearHistory: (state, action: PayloadAction<ClearHistoryParams>) => {
			const { projectId } = action.payload;

			// Валидация: проверяем существование проекта
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			// Валидация: проверяем наличие истории для проекта
			if (!state.history[projectId]) throw new Error(`No history found for project with ID ${projectId}`);

			// Валидация: запрещаем очистку, если в истории только одна запись
			if (state.history[projectId].history.length <= 1)
				throw new Error('Cannot clear history: only initial state exists');

			// Сохраняем начальную запись истории (самый первый снимок)
			const initialHistoryEntry = state.history[projectId].history[0];

			// Очищаем историю
			state.history[projectId].history = [initialHistoryEntry];
			state.history[projectId].pointer = 0;
			state.history[projectId].active = true;

			// Сбрасываем sliced флаг (если он есть)
			if (state.history[projectId].sliced !== undefined) {
				state.history[projectId].sliced = false;
			}

			// Восстанавливаем состояние из начальной записи истории
			state.layers[projectId] = [...initialHistoryEntry.layers];

			// Восстанавливаем состояние из начальной записи истории
			if (initialHistoryEntry.objects) {
				state.canvasObjects = [...initialHistoryEntry.objects];
			} else {
				// Если в начальной записи нет объектов, очищаем canvasObjects
				state.canvasObjects = state.canvasObjects.filter(
					object => !state.layers[projectId].some(layer => layer.id === object.layerId),
				);
			}

			// Устанавливаем активный слой из начальной записи истории
			if (initialHistoryEntry.activeLayer) {
				state.activeLayer = initialHistoryEntry.activeLayer;
			}
		},

		setPreviewSaved: (state, action: PayloadAction<{ manual?: boolean }>) => {
			const { manual = false } = action.payload;

			state.save.lastPreviewSavedAt = Date.now();
			state.save.lastSaveWasManual = manual;
		},

		addCanvasObject: (state, action: PayloadAction<Drawable>) => {
			state.canvasObjects.push(action.payload);
		},

		updateCanvasObject: (state, action: PayloadAction<{ id: string; updates: Partial<Drawable> }>) => {
			const obj = state.canvasObjects.find(object => object.id === action.payload.id);
			if (obj) Object.assign(obj, action.payload.updates);
		},

		removeCanvasObject: (state, action: PayloadAction<string>) => {
			state.canvasObjects = state.canvasObjects.filter(object => object.id !== action.payload);
		},
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
};

export const isRedoActiveSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;
	const pointer = history[projectId].pointer;

	return pointer < history[projectId].history.length - 1;
};

export const pointerSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;

	return history[projectId].pointer;
};

export const isHistoryActiveSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;

	return history[projectId].active;
};

export const isHistorySlicedSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;

	return history[projectId].sliced;
};

export const historySelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;

	return [...history[projectId].history];
};

export const canvasObjectsByLayerSelector = (state: RootState, layerId: string) =>
	state.projects.canvasObjects.filter(obj => obj.layerId === layerId);

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
	clearHistory,
	addCanvasObject,
	updateCanvasObject,
	removeCanvasObject,
	setPreviewSaved,
} = projectsSlice.actions;

export default projectsSlice.reducer;
