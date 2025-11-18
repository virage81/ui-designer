import type { IHistoryEntry } from "./history-entry.interface";
import type { ILayer } from "./layer.interface";

export interface IProject {
	id: number;
	name: string;
	date: string;
	width: number;
	height: number;
	preview: string;
	layers: ILayer[];
	history: IHistoryEntry[];
}
