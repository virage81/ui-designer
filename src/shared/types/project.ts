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

export interface Stack {
	history: History[];
	pointer: number;
}
export interface History {
	id: number;
	date: string;
	layers: Layer[],
	type: HISTORY_ACTIONS | ACTIONS;
	uniqId: string;
}

export interface Layer {
	id: string;
	name: string;
	isBase: boolean;
	opacity: number;
	zIndex: number;
	hidden: boolean;
	cleared?: boolean;
	canvasDataURL?: string;
}
