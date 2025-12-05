import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/index';
import type { Layer } from '@shared/types/project';
import { useCanvasContext } from '@/contexts/useCanvasContext.ts';
import { renderProjectCanvas } from '@shared/utils/canvasRenderer';

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

		const canvas = renderProjectCanvas(
			currentProject.width,
			currentProject.height,
			projectLayers,
			canvasesRef
		);

		const dataUrl = canvas.toDataURL('image/png');
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
