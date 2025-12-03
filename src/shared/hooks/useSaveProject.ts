import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useCanvasContext } from '@/contexts/useCanvasContext';
import { saveLayerCanvasData } from '@store/slices/projectsSlice';
import type { RootState } from '@store/index';
import type {Layer} from "@shared/types/project.ts";

export const useSaveProject = () => {
	const dispatch = useDispatch();
	const { id: projectId } = useParams<{ id: string }>();
	const { canvases } = useCanvasContext();
	const layersByProject = useSelector((state: RootState) => state.projects.layers);

	return useCallback(async () => {
		if (!projectId) return;

		const projectLayers: Layer[] = layersByProject[projectId] ?? [];

		projectLayers.forEach(layer => {
			const canvas = canvases[layer.id];
			if (canvas) {
				const canvasData = canvas.toDataURL('image/png');
				dispatch(saveLayerCanvasData({
					projectId,
					layerId: layer.id,
					canvasData
				}));
			}
		});
	}, [projectId, layersByProject, canvases, dispatch]);
};
