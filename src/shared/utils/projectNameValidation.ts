import type { Project } from '@shared/types/project';

const NAME_PATTERN = /^[A-Za-zА-Яа-яЁё0-9\s]+$/;

export const validateProjectName = (
	name: string,
	projects: Project[],
	currentProjectId?: string
): string => {
	const trimmed = name.trim();

	if (trimmed.length === 0) {
		return 'Название обязательно';
	}

	if (!NAME_PATTERN.test(trimmed)) {
		return 'Допустимы буквы и цифры';
	}

	if (projects.some(p => p.name === trimmed && p.id !== currentProjectId)) {
		return 'Проект с таким именем уже существует';
	}

	return '';
};
