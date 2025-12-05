import type { Layer } from '@shared/types/project';

export const renderProjectCanvas = (
	projectWidth: number,
	projectHeight: number,
	projectLayers: Layer[],
	canvasesRef: Record<string, HTMLCanvasElement>
): HTMLCanvasElement => {
	const dpr = window.devicePixelRatio || 1;

	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = Math.floor(projectWidth * dpr);
	tempCanvas.height = Math.floor(projectHeight * dpr);
	tempCanvas.style.width = `${projectWidth}px`;
	tempCanvas.style.height = `${projectHeight}px`;

	const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) throw new Error('Failed to get canvas context');

	ctx.scale(dpr, dpr);
	ctx.imageSmoothingEnabled = false;
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, projectWidth, projectHeight);

	const visibleLayers = projectLayers
		.filter(l => !l.hidden && canvasesRef[l.id])
		.sort((a, b) => a.zIndex - b.zIndex);

	visibleLayers.forEach(layer => {
		const canvas = canvasesRef[layer.id];
		ctx.save();
		ctx.globalAlpha = layer.opacity / 100;
		ctx.drawImage(canvas, 0, 0, projectWidth, projectHeight);
		ctx.restore();
	});

	return tempCanvas;
};
