import type { Layer, Project, HistoryStack } from '@shared/types/project.ts';

export interface ProjectsSliceState {
	projects: Project[];
	history: Record<Project['id'], HistoryStack>;
	layers: Record<Project['id'], Layer[]>;
	activeLayer: Layer | null;
	zoom: number;
}
