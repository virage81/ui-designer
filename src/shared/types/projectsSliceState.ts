import type { History, Layer, Project } from '@shared/types/project.ts';

export interface ProjectsSliceState {
	projects: Project[];
	history: Record<Project['id'], History[]>;
	layers: Record<Project['id'], Layer[]>;
	activeLayer: Layer | null;
	zoom: number;
}
