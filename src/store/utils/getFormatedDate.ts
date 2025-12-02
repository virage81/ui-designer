export const getFormatedDate = () => {
	const date = new Date();
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	}).format(date);
};
