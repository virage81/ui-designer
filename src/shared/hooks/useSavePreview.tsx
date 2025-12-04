import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateProject } from '@store/slices/projectsSlice';
import type { Layer, Project } from '@shared/types/project';
import { renderProjectCanvas } from '@shared/utils/canvasRenderer';

export const useSaveProjectPreview = (
	currentProject: Project,
	projectLayers: Layer[],
	canvases: Record<string, HTMLCanvasElement>
) => {
	const dispatch = useDispatch();

	return useCallback(() => {
		if (!currentProject || !projectLayers.length) return;

		const canvasesRef: Record<string, HTMLCanvasElement> = {};
		projectLayers.forEach(layer => {
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

		const previewDataUrl = canvas.toDataURL('image/jpeg', 0.7);
		dispatch(updateProject({ id: currentProject.id, preview: previewDataUrl }));
	}, [currentProject, projectLayers, canvases, dispatch]);
};
