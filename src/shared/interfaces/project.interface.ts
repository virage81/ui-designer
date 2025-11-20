import type { HistoryEntry } from "./history-entry.interface";
import type { Layer } from "./layer.interface";

export interface Project {
	id: number;
	name: string;
	date: string;
	width: number;
	height: number;
	preview: string;
	layers: Layer[];
	history: HistoryEntry[];
}
