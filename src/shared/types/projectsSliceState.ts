import type { Stack, Layer, Project } from '@shared/types/project.ts';

export interface ProjectsSliceState {
	projects: Project[];
	// history: Record<Project['id'], History[]>;
	stack: Record<Project['id'], Stack>;
	layers: Record<Project['id'], Layer[]>;
	activeLayer: Layer | null;
}
