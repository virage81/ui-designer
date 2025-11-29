export const debounce = (fn: () => void, delay: number): (() => void) => {
	let timeoutId: number;

	const debounced = () => {
		clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => fn.call(this), delay);
	};

	return debounced;
};
