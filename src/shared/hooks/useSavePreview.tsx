import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateProject } from '@store/slices/projectsSlice';
import type { Layer, Project } from '@shared/types/project';

export const useSaveProjectPreview = (
	currentProject: Project,
	projectLayers: Layer[],
	canvases: Record<string, HTMLCanvasElement>
) => {
	const dispatch = useDispatch();

	const savePreview = useCallback(() => {
		if (!currentProject || !projectLayers.length) return;

		const canvasesRef: Record<string, HTMLCanvasElement> = {};
		projectLayers.forEach(layer => {
			const canvas = canvases[layer.id];
			if (canvas) canvasesRef[layer.id] = canvas;
		});

		if (!Object.keys(canvasesRef).length) return;

		const tempCanvas = document.createElement('canvas');
		const dpr = window.devicePixelRatio || 1;
		const PREVIEW_SIZE = 300;
		const previewScale = Math.min(PREVIEW_SIZE / currentProject.width, PREVIEW_SIZE / currentProject.height);
		const previewWidth = currentProject.width * previewScale;
		const previewHeight = currentProject.height * previewScale;

		tempCanvas.width = Math.floor(previewWidth * dpr);
		tempCanvas.height = Math.floor(previewHeight * dpr);
		tempCanvas.style.width = `${previewWidth}px`;
		tempCanvas.style.height = `${previewHeight}px`;

		const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) return;

		ctx.scale(dpr, dpr);
		ctx.imageSmoothingEnabled = false;
		ctx.imageSmoothingQuality = 'high';
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, previewWidth, previewHeight);

		const visibleLayers = projectLayers
			.filter(l => !l.hidden && canvasesRef[l.id])
			.sort((a, b) => a.zIndex - b.zIndex);

		visibleLayers.forEach(layer => {
			const canvas = canvasesRef[layer.id];
			ctx.save();
			ctx.globalAlpha = layer.opacity / 100;
			ctx.drawImage(canvas, 0, 0, previewWidth, previewHeight);
			ctx.restore();
		});

		const previewDataUrl = tempCanvas.toDataURL('image/png', 0.5);

		dispatch(updateProject({
			id: currentProject.id,
			preview: previewDataUrl
		}));
	}, [currentProject, projectLayers, canvases, dispatch]);

	return savePreview;
};
