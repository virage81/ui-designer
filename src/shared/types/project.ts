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
}
export interface History {
	id: number;
	date: string;
	type: HISTORY_ACTIONS | ACTIONS;
	canvasData: string;
}

export interface Layer {
	id: string;
	name: string;
	opacity: number;
	zIndex: number;
	hidden: boolean;
	canvasDataURL?: string;
	canvasData?: string;
}

export interface AddToHistoryParams {
	projectId: string;
	layerId: string;
	type: HISTORY_ACTIONS | ACTIONS;
}

export interface UndoRedoHistoryParams {
	projectId: Project['id'];
	layerId: Layer['id'];
}

export interface SetHistoryParams {
	projectId: Project['id'];
	layerId: Layer['id'];
	index: number;
};

export interface SaveHistorySnapshotParams {
	projectId: Project['id'];
	layerId: Layer['id'];
	canvasDataURL: string;
};
