import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '@shared/helpers';
import type { History, Layer, Project } from '@shared/types/project';
import type {
	CreateLayerParams,
	CreateProjectParams,
	DeleteLayerParams,
	DeleteProjectParams,
	SetActiveLayerParams,
	UpdateLayerParams,
	UpdateProjectParams,
} from './projectSliceTypes';

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
		createProject: (state, action: PayloadAction<CreateProjectParams>) => {
			state.projects.push({ ...action.payload, id: generateId(), preview: '' });
		},
		updateProject: (state, action: PayloadAction<UpdateProjectParams>) => {
			const projectIndex = state.projects.findIndex(item => item.id === action.payload.id);
			if (projectIndex === -1) throw new Error(`Project with ID ${action.payload.id} not found`);

			state.projects[projectIndex] = { ...state.projects[projectIndex], ...action.payload };
		},
		deleteProject: (state, action: PayloadAction<DeleteProjectParams>) => {
			const projectIndex = state.projects.findIndex(item => item.id === action.payload.id);
			if (!projectIndex) throw new Error(`Project with ID ${action.payload.id} not found`);

			state.projects.splice(projectIndex, 1);
		},

		createLayer: (state, action: PayloadAction<CreateLayerParams>) => {
			state.layers[action.payload.projectId].push({ ...action.payload.data, id: generateId() });
		},
		updateLayer: (state, action: PayloadAction<UpdateLayerParams>) => {
			const { data, projectId } = action.payload;

			const layerIndex = state.layers[projectId].findIndex(item => item.id === data.id);
			if (layerIndex === -1) throw new Error(`Layer with ID ${data.id} not found`);

			state.layers[projectId][layerIndex] = { ...state.layers[projectId][layerIndex], ...data };
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

export const { createProject, updateProject, deleteProject, createLayer, updateLayer, deleteLayer, setActiveLayer } =
	projectsSlice.actions;

export default projectsSlice.reducer;
