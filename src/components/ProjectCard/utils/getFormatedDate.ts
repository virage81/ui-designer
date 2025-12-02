export const getFormatedDate = (timestamp: string): string => {
	const date = new Date(timestamp);
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	}).format(date);
};
