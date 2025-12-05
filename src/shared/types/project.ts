import type { HISTORY_ACTIONS } from "@store/slices/projectsSlice.enums";
import type { ACTIONS } from "@store/slices/toolsSlice";

export interface Project {
	id: string;
	name: string;
	date: string;
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
	layers: (Layer & { canvasDataURL?: string })[];
	type: HISTORY_ACTIONS | ACTIONS;
}

export interface Layer {
	id: string;
	name: string;
	opacity: number;
	zIndex: number;
	hidden: boolean;
	canvasDataURL?: string;
}

export interface AddToHistoryPayload {
	projectId: string;
	type: HISTORY_ACTIONS | ACTIONS;
}

export interface UndoRedoHistoryParams {
	projectId: Project['id'];
	pointer?: number;
}

export interface SetHistoryParams {
	projectId: Project['id'];
	pointer: number;
};

export interface SaveHistorySnapshotParams {
	projectId: Project['id'];
	layerId: Layer['id'];
	canvasDataURL: string;
};
