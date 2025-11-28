import { Box } from '@mui/material';
import type { RootState } from '@store/index';
import { sortedLayersSelector, updateLayer } from '@store/slices/projectsSlice';
import { ACTIONS } from '@store/slices/toolsSlice';
import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redirect, useParams } from 'react-router-dom';
import { BrushTool } from './tools/Brush';
import { LineTool } from './tools/Line';
import { RectangleTool } from './tools/Rect';
import { CircleTool } from './tools/Circle';
import type { Styles, Tools } from './tools/Tool';
import { EraserTool } from './tools/Eraser';

export const Canvas: React.FC = () => {
	const { id: projectId = '' } = useParams();
	const dispatch = useDispatch();

	const { activeLayer, projects } = useSelector((state: RootState) => state.projects);
	const { tool, fillColor, strokeWidth, strokeStyle } = useSelector((state: RootState) => state.tools);
	const sortedLayers = useSelector((state: RootState) => sortedLayersSelector(state, projectId));

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const toolRef = useRef<Tools | null>(null);

	const currentProject = useMemo(() => projects.find(item => item.id === projectId), [projectId, projects]);
	const toolStyles = useMemo<Styles>(
		() => ({ fill: fillColor, strokeWidth, strokeStyle }),
		[fillColor, strokeWidth, strokeStyle],
	);

	useEffect(() => {
		if (toolRef.current) {
			toolRef.current.destroyEvents();
			toolRef.current = null;
		}

		if (!canvasRef.current) return;

		switch (tool) {
			case ACTIONS.BRUSH: {
				toolRef.current = new BrushTool(canvasRef.current, toolStyles);
				break;
			}
			case ACTIONS.RECTANGLE: {
				toolRef.current = new RectangleTool(canvasRef.current, toolStyles);
				break;
			}
			case ACTIONS.CIRCLE: {
				toolRef.current = new CircleTool(canvasRef.current, toolStyles);
				break;
			}
			case ACTIONS.LINE: {
				toolRef.current = new LineTool(canvasRef.current, toolStyles);
				break;
			}
			case ACTIONS.ERASER: {
				toolRef.current = new EraserTool(canvasRef.current, toolStyles);
				break;
			}
			default: {
				break;
			}
		}

		return () => {
			if (toolRef.current) {
				toolRef.current.destroyEvents();
				toolRef.current = null;
			}
		};
	}, [tool, activeLayer, toolStyles]);

	useEffect(() => {
		if (!canvasRef.current || !activeLayer) return;

		if (activeLayer.cleared) {
			const ctx = canvasRef.current.getContext('2d');

			if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

			dispatch(updateLayer({ projectId, data: { id: activeLayer.id, cleared: false } }));
		}
	}, [activeLayer, projectId, dispatch]);

	if (!currentProject) {
		redirect('/404');
		return;
	}

	return (
		<Box
			sx={{
				position: 'relative',
				width: currentProject.width,
				height: currentProject.height,
				cursor: tool !== ACTIONS.SELECT ? 'crosshair' : 'auto',
			}}>
			{sortedLayers.map(layer => {
				return (
					<canvas
						id={layer.id}
						key={layer.id}
						width={currentProject.width}
						height={currentProject.height}
						ref={layer.id === activeLayer?.id ? canvasRef : undefined}
						style={{
							background: layer.isBase ? 'white' : 'transparent',
							position: 'absolute',
							inset: 0,
							zIndex: layer.zIndex,
							opacity: layer.isBase ? 1 : layer.hidden ? 0 : layer.opacity / 100,
							pointerEvents: layer.id === activeLayer?.id ? 'auto' : 'none',
						}}
					/>
				);
			})}
		</Box>
	);
};
