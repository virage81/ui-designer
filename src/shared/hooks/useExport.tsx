import {useCallback} from 'react';
import {useParams} from 'react-router-dom';
import {useSelector} from 'react-redux';
import type {RootState} from '@store/index';
import {type Layer} from '@shared/types/project'

export const useExportPNG = () => {
	const { id: projectId } = useParams<{ id: string }>();
	const projects = useSelector((state: RootState) => state.projects.projects);
	const layersByProject = useSelector((state: RootState) => state.projects.layers);

	return useCallback(() => {
		if (!projectId) return;

		const currentProject = projects.find(p => p.id === projectId);
		if (!currentProject) return;

		const projectLayers = layersByProject[projectId] || [];
		if (projectLayers.length === 0) return;

		const allCanvases = Array.from(document.querySelectorAll('canvas[id]') as NodeListOf<HTMLCanvasElement>);

		const canvasesRef: Record<string, HTMLCanvasElement> = {};

		projectLayers.forEach((layer: Layer) => {
			const canvas = allCanvases.find(c => c.id.includes(layer.id));
			if (canvas) {
				canvasesRef[layer.id] = canvas;
			}
		});

		if (Object.keys(canvasesRef).length === 0) return;

		const tempCanvas = document.createElement('canvas');
		const dpr = window.devicePixelRatio || 1;
		const width = currentProject.width;
		const height = currentProject.height;

		tempCanvas.width = Math.floor(width * dpr);
		tempCanvas.height = Math.floor(height * dpr);
		tempCanvas.style.width = `${width}px`;
		tempCanvas.style.height = `${height}px`;

		const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) return;

		ctx.scale(dpr, dpr);
		ctx.imageSmoothingEnabled = false;

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);

		const visibleLayers = projectLayers
			.filter((layer: Layer) => !layer.hidden && canvasesRef[layer.id])
			.sort((a: Layer, b: Layer) => a.zIndex - b.zIndex);

		visibleLayers.forEach((layer: Layer) => {
			const canvas = canvasesRef[layer.id];
			ctx.save();
			ctx.globalAlpha = layer.opacity / 100;
			ctx.drawImage(canvas, 0, 0, width, height);
			ctx.restore();
		});

		const link = document.createElement('a');
		link.download = `${currentProject.name || 'project'}.png`;
		link.href = tempCanvas.toDataURL('image/png');
		link.click();
	}, [projectId, projects, layersByProject]);
};
