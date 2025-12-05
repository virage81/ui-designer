import type { Project } from '@shared/types/project';
import { getZero } from './getZero';

export const getNewProjectName = (defaultName: Project['name'], projects: Project[]): Project['name'] => {
	let numberOfProjects = 1;
	let newProjectName = `${defaultName} ${getZero(numberOfProjects)}`;

	while (projects.some((p: Project) => p.name === newProjectName)) {
		numberOfProjects = numberOfProjects + 1;
		newProjectName = `${defaultName} ${getZero(numberOfProjects)}`;
	}

	return newProjectName;
};
