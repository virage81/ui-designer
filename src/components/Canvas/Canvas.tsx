import { Box } from '@mui/material';
import type { RootState } from '@store/index';
import { sortedLayersSelector, updateLayer } from '@store/slices/projectsSlice';
import { ACTIONS } from '@store/slices/toolsSlice';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redirect, useParams } from 'react-router-dom';
import { BrushTool } from './tools/Brush';
import { CircleTool } from './tools/Circle';
import { EraserTool } from './tools/Eraser';
import { LineTool } from './tools/Line';
import { RectangleTool } from './tools/Rect';
import { TextTool } from './tools/Text';
import type { Styles, Tools } from './tools/Tool';
import {useCanvasContext} from "@/contexts/useCanvasContext.ts";
import {useSaveProjectPreview} from "@shared/hooks/useSavePreview.tsx";
import {useProject} from "@shared/hooks/useProject.tsx";

export const Canvas: React.FC = () => {
	const { id: projectId = '' } = useParams();
	const dispatch = useDispatch();
	const { register, unregister } = useCanvasContext();

	const { activeLayer } = useSelector((state: RootState) => state.projects);
	const { tool, fillColor, strokeWidth, strokeStyle, fontSize } = useSelector((state: RootState) => state.tools);
	const sortedLayers = useSelector((state: RootState) => sortedLayersSelector(state, projectId));

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const toolRef = useRef<Tools | null>(null);
	const dprSetupsRef = useRef<Record<string, boolean>>({});
	const canvasesRef = useRef<Record<string, HTMLCanvasElement>>({});

	const currentProject = useProject()

	const { canvases } = useCanvasContext();
	const layersByProject = useSelector((state: RootState) => state.projects.layers);
	const projectLayers = layersByProject[projectId ?? ''] ?? []
	const saveProjectPreview = useSaveProjectPreview(currentProject, projectLayers, canvases);


	const toolStyles = useMemo<Styles>(
		() => ({ fill: fillColor, strokeWidth, strokeStyle, fontSize }),
		[fillColor, strokeWidth, strokeStyle, fontSize],
	);

	const setupCanvasDPR = useCallback((canvas: HTMLCanvasElement) => {
		if (!canvas || dprSetupsRef.current[canvas.id]) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();

		canvas.width = Math.floor(rect.width * dpr);
		canvas.height = Math.floor(rect.height * dpr);
		canvas.style.width = `${rect.width}px`;
		canvas.style.height = `${rect.height}px`;

		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		if (ctx) {
			ctx.scale(dpr, dpr);
			ctx.imageSmoothingEnabled = false;
		}

		dprSetupsRef.current[canvas.id] = true;
	}, []);

	useEffect(() => {
		const saveInterval = setInterval(() => {
			saveProjectPreview()
		}, 1000);

		return () => clearInterval(saveInterval);
	}, [ saveProjectPreview]);

	useEffect(() => {
		if (toolRef.current) {
			toolRef.current.destroyEvents();
			toolRef.current = null;
		}

		if (!canvasRef.current || !activeLayer) return;

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
			case ACTIONS.TEXT: {
				toolRef.current = new TextTool(canvasRef.current, toolStyles);
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
		if (!canvasRef.current || !activeLayer || !currentProject) return;

		if (activeLayer.cleared) {
			const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
			if (ctx) {
				ctx.clearRect(0, 0, currentProject.width, currentProject.height);
				dispatch(updateLayer({ projectId, data: { id: activeLayer.id, cleared: false } }));
			}
		}
	}, [activeLayer, currentProject, projectId, dispatch]);

	useEffect(() => {
		if (canvasRef.current) {
			setupCanvasDPR(canvasRef.current);
		}
	}, [activeLayer?.id, setupCanvasDPR]);

	if (!currentProject) {
		redirect('/404');
		return null;
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				flexGrow: 1,
				gap: '0.5rem',
				width: '63px',
				padding: '8px 8px',
				backgroundColor: 'var(--main-bg)',
				overflow: 'auto',
			}}>
			<Box
				sx={{
					position: 'relative',
					width: currentProject.width,
					height: currentProject.height,
					cursor: tool !== ACTIONS.SELECT ? 'crosshair' : 'auto',
					boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.1)',
				}}>
				<canvas
					style={{
						background: 'white',
						position: 'absolute',
						inset: 0,
						zIndex: 0,
						pointerEvents: 'none',
						width: `${currentProject.width}px`,
						height: `${currentProject.height}px`,
					}}
				/>
				{sortedLayers.map(layer => (
					<canvas
						id={layer.id}
						key={layer.id}
						ref={el => {
							if (el) {
								canvasesRef.current[layer.id] = el;
								if (layer.id === activeLayer?.id) {
									canvasRef.current = el;
									setupCanvasDPR(el);
								}
								register(layer.id, el);
							} else {
								delete canvasesRef.current[layer.id];
								unregister(layer.id);
							}
						}}
						style={{
							background: 'transparent',
							position: 'absolute',
							inset: 0,
							zIndex: layer.zIndex,
							opacity: layer.hidden ? 0 : layer.opacity / 100,
							pointerEvents: layer.id === activeLayer?.id ? 'auto' : 'none',
							width: `${currentProject.width}px`,
							height: `${currentProject.height}px`,
						}}
					/>
				))}
			</Box>
		</Box>
	);
};
