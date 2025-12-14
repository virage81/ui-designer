import type { HistoryStack, Layer, Project } from '@shared/types/project.ts';
import type { Drawable } from './canvas';

export interface ProjectsSliceState {
	projects: Project[];
	history: Record<Project['id'], HistoryStack>;
	layers: Record<Project['id'], Layer[]>;
	activeLayer: Layer | null;
	zoom: number;
	guides: {
		enabled: boolean;
		columns: number;
		rows: number;
	};
	save: {
		lastPreviewSavedAt: number | null;
		lastSaveWasManual: boolean;
	};
	canvasObjects: Drawable[];
}
