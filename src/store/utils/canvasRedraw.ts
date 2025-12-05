import type { Layer } from "@shared/types/project";

export const redrawCanvas = (canvas: HTMLCanvasElement, layers: Layer[]) => {
	if (!canvas) return;

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

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

		if (!l?.canvasDataURL) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	})
};
