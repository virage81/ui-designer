import type { HISTORY_ACTIONS } from "@store/slices/projectsSlice.enums";
import type { ACTIONS } from "@store/slices/toolsSlice";

export interface Project {
	id: string;
	name: string;
	date: number;
	width: number;
	height: number;
	preview: string;
}

export interface HistoryStack {
	history: History[];
	pointer: number;
	active?: boolean;
	sliced?: boolean;
}
export interface History {
	id: number;
	date: number;
	type: HISTORY_ACTIONS | ACTIONS;
	layers: Layer[];
	activeLayer?: Layer | null;
}

export interface Layer {
	id: string;
	name: string;
	opacity: number;
	zIndex: number;
	hidden: boolean;
	canvasDataURL: string;
	canvasData?: string;
}

export interface AddToHistoryParams {
	projectId: string;
	activeLayer: Layer;
	type: HISTORY_ACTIONS | ACTIONS;
	canvasDataURL: string;
}

export interface UndoRedoHistoryParams {
	projectId: Project['id'];
}

export interface SetHistoryParams {
	projectId: Project['id'];
	id: number;
};

export interface SaveHistorySnapshotParams {
	projectId: Project['id'];
	layerId: Layer['id'];
	canvasDataURL: string;
};

export interface SetHistoryActivityParams {
	projectId: Project['id'];
};

