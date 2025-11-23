import type { Project } from '@shared/types/project';
import type { ProjectsSliceState } from '@shared/types/projectsSliceState';

export const checkProjectExistence = (state: ProjectsSliceState, projectId: Project['id']) => {
	return state.projects.some(item => item.id === projectId);
};
