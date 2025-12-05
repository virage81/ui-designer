import type { Layer } from "@shared/types/project";

/**
 * функция рисования для canvas;
 * если у слоя есть canvasDataURL,
 * то рисуем содержимое;
 * если нет canvasDataURL, то по идее
 * очищаем - кейс с очисткой под вопросом.
 */
export const redrawCanvas = (canvas: HTMLCanvasElement, layers: Layer[]) => {
	if (!canvas) return;

	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) return;

	// проходим по слоям, рисуем, если есть canvasDataURL
	layers.forEach(l => {
		if (l?.canvasDataURL) {
			const img = new Image();
			img.src = l.canvasDataURL;

			img.onload = () => {
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			};

			img.onerror = () => {
				console.error('Не удалось загрузить изображение слоя:', l.id);
			};
		}

		/**
		 * тут по идее надо очищать слои, у которых нет canvasDataURL
		 * для функционала "очистить";
		 * но оно чистит прошлый слой,
		 * если нарисовали и переключились с него
		 * на новый
		 */
		if (l?.canvasDataURL === '') {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	})
};
