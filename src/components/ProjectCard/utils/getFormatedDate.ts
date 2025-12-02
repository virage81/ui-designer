import type { Project } from "@shared/types/project";

export const getFormatedDate = (timestamp: Project['date']): string => {
	const date = new Date(timestamp);
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	}).format(date);
};
