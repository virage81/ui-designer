import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '@shared/helpers';
import type { ProjectsSliceState } from '@shared/types/projectsSliceState';
import type { Layer, Project } from '@shared/types/project';
import { checkProjectExistence } from '@store/utils/projects';
import type { RootState } from '..';
import type {
	ClearActiveLayer,
	CreateLayerParams,
	CreateProjectParams,
	DeleteLayerParams,
	DeleteProjectParams,
	LoadStackParams,
	ModifyStackParams,
	SetActiveLayerParams,
	UndoRedoStackParams,
	UpdateLayerParams,
	UpdateProjectParams,
} from './projectSlice.types';
import { HISTORY_ACTIONS } from './projectsSlice.enums';

const initialState: ProjectsSliceState = {
	projects: [],
	// history: {},
	stack: {},
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
			const baseLayer = { id: generateId(), hidden: false, isBase: true, name: 'Фон', opacity: 100, zIndex: 1 };
			state.layers[id] = [baseLayer];
			state.activeLayer = baseLayer;

			state.stack[id] = {
				history: [
					{ id: 0, date: new Date().toUTCString(), layers: [baseLayer], type: HISTORY_ACTIONS.LAYER_ADD, uniqId: generateId() }
				],
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

		addToStack: (state, action: PayloadAction<ModifyStackParams>) => {
			const { projectId, data } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			if (!state.stack[projectId].history?.length) {
				state.stack[projectId].history[0] = { ...data, id: 0, date: new Date().toUTCString(), uniqId: generateId() };
			} else {
				state.stack[projectId].pointer++;
				const pointer = state.stack[projectId].pointer;

				if (state.stack[projectId].history.length - 1 > pointer) {
					const diff = state.stack[projectId].history.length - pointer;
					state.stack[projectId].history.splice(pointer, diff);
				}

				state.stack[projectId].history[pointer] = { ...data, id: pointer, date: new Date().toUTCString(), uniqId: generateId() };
			}
		},

		undo: (state, action: PayloadAction<UndoRedoStackParams>) => {
			const { projectId, pointer } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);
			if ((pointer && pointer < 0)) throw new Error(`Pointer is ${pointer}. Pointer could not be less than 0`);

			if (pointer !== 0) {
				if (!pointer) {
					state.stack[projectId].pointer--;
					const newPointer = state.stack[projectId].pointer;

					if (state.stack[projectId].history[newPointer]?.layers) {
						state.layers[projectId] = [];
						state.layers[projectId] = state.stack[projectId].history[newPointer].layers;
					}
				} else {
					state.stack[projectId].pointer = pointer - 1;

					if (state.stack[projectId].history[pointer - 1]?.layers) {
						state.layers[projectId] = [];
						state.layers[projectId] = state.stack[projectId].history[pointer - 1].layers;
					}
				}
			} else {
				state.stack[projectId].pointer = 0;

				if (state.stack[projectId].history[0]?.layers) {
					state.layers[projectId] = [];
					state.layers[projectId] = state.stack[projectId].history[0].layers;
				}
			}
		},

		redo: (state, action: PayloadAction<UndoRedoStackParams>) => {
			const { projectId, pointer } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			if (!pointer) {
				if (state.stack[projectId].history[state.stack[projectId].pointer + 1]?.layers) {
					state.layers[projectId] = [];
					state.layers[projectId] = state.stack[projectId].history[state.stack[projectId].pointer + 1].layers;
					state.stack[projectId].pointer++;
				}
			} else {
				state.stack[projectId].pointer = pointer;

				if (state.stack[projectId].history[pointer + 1]?.layers) {
					state.layers[projectId] = [];
					state.layers[projectId] = state.stack[projectId].history[pointer + 1].layers;
				} else {
					state.layers[projectId] = state.stack[projectId].history[pointer].layers;
				}
			}
		},

		loadStackElement: (state, action: PayloadAction<LoadStackParams>) => {
			const { projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			if (state.stack[projectId].history?.length > 1) {
				const pointer = state.stack[projectId].pointer;
				historyDrawHelper(state, projectId, pointer);
			}
		},

		saveLayersSnaps: (state, action: PayloadAction<LoadStackParams>) => {
			const { projectId } = action.payload;
			if (!checkProjectExistence(state, projectId)) throw new Error(`Project with ID ${projectId} does not exist`);

			if (state.layers[projectId].length >= 1) {
				state.layers[projectId].forEach((l: Layer) => {
					if (l?.id) {
						const canvas = document.getElementById(l.id) as HTMLCanvasElement;

						if (canvas) {
							l.canvasDataURL = canvas.toDataURL();
						}
					}
				})
			}
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

export const isUndoActiveSelector = (state: RootState, projectId: Project['id']) => {
	const { stack } = state.projects;
	const pointer = stack[projectId].pointer;

	return pointer > 0 ? true : false;
}

export const isRedoActiveSelector = (state: RootState, projectId: Project['id']) => {
	const { stack } = state.projects;
	const pointer = stack[projectId].pointer;

	return pointer < stack[projectId].history.length - 1 ? true : false;
}

const historyDrawHelper = (state: ProjectsSliceState, projectId: Project['id'], pointer: number) => {
	const history = state.stack[projectId].history;

	const layers = pointer < history[history.length - 1]?.id
		? history[pointer].layers
		: state.layers[projectId];

	layers.forEach((l: Layer) => {
		if (l?.canvasDataURL) {
			const img = new Image();
			img.src = l.canvasDataURL;
			const canvas = document.getElementById(l.id) as HTMLCanvasElement;
			img.onload = () => {
				const ctx = canvas.getContext('2d');

				if (ctx) {
					const width = ctx.canvas.width;
					const height = ctx.canvas.height;
					ctx.clearRect(0, 0, width, height)
					ctx.drawImage(img, 0, 0, width, height);
				}
			};
		}
	})
}

export const pointerSelector = (state: RootState, projectId: Project['id']) => {
	const { stack } = state.projects;

	return stack[projectId].pointer;
};

export const historySelector = (state: RootState, projectId: Project['id']) => {
	const { stack } = state.projects;

	return [...stack[projectId].history];
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
	addToStack,
	loadStackElement,
	saveLayersSnaps,
	undo,
	redo,
} = projectsSlice.actions;

export default projectsSlice.reducer;
