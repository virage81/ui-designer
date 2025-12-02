import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/index';
import type { Layer } from '@shared/types/project';
import {useCanvasContext} from "@/contexts/CanvasContext.tsx";

export const useExportPNG = () => {
	const { id: projectId } = useParams<{ id: string }>();
	const projects = useSelector((state: RootState) => state.projects.projects);
	const layersByProject = useSelector((state: RootState) => state.projects.layers);
	const { canvases } = useCanvasContext();

	return useCallback(async () => {
		if (!projectId) return;

		const currentProject = projects.find(p => p.id === projectId);
		if (!currentProject) return;

		const projectLayers = layersByProject[projectId] ?? [];
		if (!projectLayers.length) return;

		const canvasesRef: Record<string, HTMLCanvasElement> = {};
		projectLayers.forEach((layer: Layer) => {
			const canvas = canvases[layer.id];
			if (canvas) canvasesRef[layer.id] = canvas;
		});

		if (!Object.keys(canvasesRef).length) return;

		const tempCanvas = document.createElement('canvas');
		const dpr = window.devicePixelRatio || 1;
		const { width, height } = currentProject;

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
			.filter(l => !l.hidden && canvasesRef[l.id])
			.sort((a, b) => a.zIndex - b.zIndex);

		visibleLayers.forEach(layer => {
			const canvas = canvasesRef[layer.id];
			ctx.save();
			ctx.globalAlpha = layer.opacity / 100;
			ctx.drawImage(canvas, 0, 0, width, height);
			ctx.restore();
		});

		const dataUrl = tempCanvas.toDataURL('image/png');
		const blob = await (await fetch(dataUrl)).blob();
		const filename = `${currentProject.name || 'project'}.png`;

		if ('showSaveFilePicker' in window) {
			const fileHandle = await window.showSaveFilePicker({
				suggestedName: filename,
				types: [{ description: 'PNG Images', accept: { 'image/png': ['.png'] } }],
			});
			const writable = await fileHandle.createWritable();
			await writable.write(blob);
			await writable.close();
			return;
		}

		const link = document.createElement('a');
		link.download = filename;
		link.href = dataUrl;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}, [projectId, projects, layersByProject, canvases]);
};
