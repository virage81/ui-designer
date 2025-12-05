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
	zoom: 1,
};

const projectsSlice = createSlice({
	name: 'projects',
	initialState,
	reducers: {
		createProject: (state, action: PayloadAction<CreateProjectParams>) => {
			const id = generateId();

			state.projects.push({ ...action.payload, id, preview: '', date: new Date().getTime() });
			const layer = { id: generateId(), hidden: false, name: 'Фон', opacity: 100, zIndex: 1 };
			state.layers[id] = [layer];
			state.activeLayer = layer;
			state.history[id] = {
				/**
				 * тут заполняем историю нулевым элементом с базовым слоем.
				 * Он не будет показываться, но на данный момент нужен для работы приложения
				 */
				history: [{
					layers: [...state.layers[id]],
					type: HISTORY_ACTIONS.LAYER_ADD,
					id: '',
					date: new Date().toUTCString()
				}],
				/**
				 * pointer - общий указатель для истории, начнём с 0
				 * первый элемент истории также 0го индекса
				 */
				pointer: 0,
			};
		},

		updateProject: (state, action: PayloadAction<UpdateProjectParams>) => {
			const projectIndex = state.projects.findIndex(item => item.id === action.payload.id);
			if (projectIndex === -1) throw new Error(`Project with ID ${action.payload.id} not found`);

			state.projects[projectIndex] = {
				...state.projects[projectIndex],
				...action.payload,
				date: new Date().getTime(),
			};
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
			state.layers[payload.projectId][layerIndex].canvasData = undefined;
			state.activeLayer = state.layers[payload.projectId][layerIndex];
		},
		setZoom: (state, action: PayloadAction<number>) => {
			state.zoom = action.payload;
		},
	},

	extraReducers: (builder) => {
		// тут добавляем события в историю
		builder.addCase(addToHistory, (state, action) => {
			const { projectId, type } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			// pointer - общий указатель для истории
			const pointer = state.history[projectId].pointer;

			/**
			* если длина истории больше указателя
			* и добавляем новый элемент истории -> значит,
			* нужно удалить неактивные элементы истории.
			*
			* То есть это кейс, когда мы сделали 10 действий,
			* отменили 5 действий и сделали новое действие ->
			* теперь у нас 6 действий, а старые 5 не нужны
			*/
			if (state.history[projectId].history.length - 1 > pointer) {
				const diff = state.history[projectId].history.length - pointer;
				state.history[projectId].history.splice(pointer + 1, diff);
			}

			// тут увеличиваем указатель на шаг
			const newPointer = ++state.history[projectId].pointer;
			// и добавляем новый элемент в историю
			state.history[projectId].history[newPointer] = {
				layers: [...state.layers[projectId]],
				type,
				id: generateId(),
				date: new Date().toUTCString()
			}
		});

		// тут отменяем историю на шаг
		builder.addCase(undoHistory, (state, action) => {
			const { projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const pointer = --state.history[projectId].pointer;
			state.layers[projectId] = [...state.history[projectId].history[pointer].layers];
		});

		// тут возвращаем историю на шаг
		builder.addCase(redoHistory, (state, action) => {
			const { projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			const pointer = ++state.history[projectId].pointer;
			state.layers[projectId] = [...state.history[projectId].history[pointer].layers];
		});

		// тут выставляем историю при клике на список истории
		builder.addCase(setHistory, (state, action) => {
			const { projectId, id } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);
			if (!id) throw new Error(`History with ID ${id} does not exist`);

			const clickedElIdx = state.history[projectId].history.findIndex(h => h.id === id);

			/**
			 * если кликнули на активный элемент истории,
			 * выставляем указатель на этот элемент минус 1
			 * для того, чтобы сделать кликнутый элемент
			 * и все элементы после него (после = позже)
			 * неактивными
			 */
			if (clickedElIdx <= state.history[projectId].pointer) {
				state.history[projectId].pointer = clickedElIdx - 1;
				const newPointer = state.history[projectId].pointer;
				state.layers[projectId] = [...state.history[projectId].history[newPointer].layers];

				return;
			}

			/**
			 * если кликнули на неактивный элемент истории,
			 * активируем (возвращаем) все элементы включая
			 * тот, на который кликнули
			 */
			if (clickedElIdx > state.history[projectId].pointer) {
				state.history[projectId].pointer = clickedElIdx;
				state.layers[projectId] = [...state.history[projectId].history[clickedElIdx].layers];
			}
		});

		// тут сохраняем snapshot слоя
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

export const selectProjectById = createSelector(
	(state: RootState) => state.projects.projects,
	(_: RootState, id: string) => id,
	(projects, id) => projects.find(p => p.id === id),
);

// тут определяем активность элемента меню "Отменить"
export const isUndoActiveSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;
	const pointer = history[projectId].pointer;

	return pointer > 0 ? true : false;
}

// тут определяем активность элемента меню "Вернуть"
export const isRedoActiveSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;
	const pointer = history[projectId].pointer;

	return pointer <= history[projectId].history.length - 2 ? true : false;
}

// тут достаём указатель
export const pointerSelector = (state: RootState, projectId: Project['id']) => {
	const { history } = state.projects;

	return history[projectId].pointer;
};

// тут достаём историю
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
	setZoom
} = projectsSlice.actions;

export default projectsSlice.reducer;
