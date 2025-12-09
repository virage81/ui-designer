/**
 * функция рисования для canvas;
 * если у слоя в истории есть canvasDataURL,
 * то рисуем содержимое;
 * если нет canvasDataURL - очищаем
 */
export const redrawCanvas = (canvas: HTMLCanvasElement, currentLayerData: string) => {
	if (!canvas) return;

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (currentLayerData) {
		const img = new Image();
		img.src = currentLayerData;

		img.onload = () => {
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		};

		img.onerror = () => {
			console.error('Не удалось загрузить изображение слоя');
		};
	}
};
