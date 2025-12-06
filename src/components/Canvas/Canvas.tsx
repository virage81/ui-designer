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
	const guides = useSelector((state: RootState) => state.projects.guides);

	const GRID_COLS: number = guides.columns || 1;
	const GRID_ROWS: number = guides.rows || 1;
	const totalCells: number = GRID_COLS * GRID_ROWS;
	const showGrid: boolean = guides.enabled;

	const { activeLayer } = useSelector((state: RootState) => state.projects);
	const { tool, fillColor, strokeWidth, strokeStyle, fontSize } = useSelector((state: RootState) => state.tools);
	const sortedLayers = useSelector((state: RootState) => sortedLayersSelector(state, projectId));
	const zoom = useSelector((state: RootState) => state.projects.zoom);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const toolRef = useRef<Tools | null>(null);
	const dprSetupsRef = useRef<Record<string, boolean>>({});
	const canvasesRef = useRef<Record<string, HTMLCanvasElement>>({});

	const currentProject = useProject()

	const { canvases } = useCanvasContext();
	const layersByProject = useSelector((state: RootState) => state.projects.layers);
	const projectLayers = layersByProject[projectId ?? ''] ?? []
	const saveProjectPreview = useSaveProjectPreview(currentProject, projectLayers, canvases);
	const saveProjectPreviewRef = useRef(saveProjectPreview);

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
		saveProjectPreviewRef.current = saveProjectPreview;
	}, [saveProjectPreview]);

	useEffect(() => {
		const saveInterval = setInterval(() => {
			saveProjectPreviewRef.current();
		}, 3000);

		return () => clearInterval(saveInterval);
	}, []);

	const snapToGrid = useCallback((x: number, y: number): [number, number] => {
		if (!guides.enabled) return [x, y];

		const gridW = currentProject.width / guides.columns;
		const gridH = currentProject.height / guides.rows;
		const SNAP_TOLERANCE = gridW * 0.1;

		const nearestGridX = Math.round(x / gridW) * gridW;
		const xDiff = Math.abs(x - nearestGridX);
		const snappedX = xDiff < SNAP_TOLERANCE ? nearestGridX : x;

		const nearestGridY = Math.round(y / gridH) * gridH;
		const yDiff = Math.abs(y - nearestGridY);
		const snappedY = yDiff < SNAP_TOLERANCE ? nearestGridY : y;

		return [snappedX, snappedY];
	}, [guides, currentProject]);

	useEffect(() => {
		if (toolRef.current) {
			toolRef.current.destroyEvents();
			toolRef.current = null;
		}

		if (!canvasRef.current || !activeLayer || !currentProject.id) return;

		switch (tool) {
			case ACTIONS.BRUSH: {
				toolRef.current = new BrushTool(canvasRef.current, toolStyles, zoom, snapToGrid);
				break;
			}
			case ACTIONS.RECTANGLE: {
				toolRef.current = new RectangleTool(canvasRef.current, toolStyles, zoom, snapToGrid);
				break;
			}

			case ACTIONS.CIRCLE: {
				toolRef.current = new CircleTool(canvasRef.current, toolStyles, zoom, snapToGrid);
				break;
			}
			case ACTIONS.LINE: {
				toolRef.current = new LineTool(canvasRef.current, toolStyles, zoom, snapToGrid);
				break;
			}
			case ACTIONS.ERASER: {
				toolRef.current = new EraserTool(canvasRef.current, toolStyles, zoom);
				break;
			}
			case ACTIONS.TEXT: {
				toolRef.current = new TextTool(canvasRef.current, toolStyles, zoom, snapToGrid);
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
	}, [tool, activeLayer, toolStyles, currentProject.id,  zoom, snapToGrid]);

	useEffect(() => {
		if (!canvasRef.current || !activeLayer) return;

		if (activeLayer.cleared) {
			const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
			if (ctx) {
				ctx.clearRect(0, 0, currentProject.width, currentProject.height);
				dispatch(updateLayer({ projectId, data: { id: activeLayer.id, cleared: false } }));
			}
		}
	}, [activeLayer, projectId, dispatch, currentProject.height, currentProject.width ]);

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
				m: '0 auto',
				width: '100%',
				padding: '8px 8px',
				backgroundColor: 'var(--main-bg)',
				overflow: 'auto',
			}}>
			<Box
				sx={{
					position: 'relative',
					m: `${zoom <= 1.2 ? '0 auto' : '0'}`,
					width: currentProject.width,
					height: currentProject.height,
					cursor: tool !== ACTIONS.SELECT ? 'crosshair' : 'auto',
					boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.1)',
					transform: `scale(${zoom})`,
					transformOrigin: `${zoom <= 1 ? '50% 20%' : 'top left'}`
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
				{showGrid && (
					<Box
						sx={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							pointerEvents: 'none',
							zIndex: 1000,
							display: 'grid',
							gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
							gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
							gap: 0,
							...(guides.enabled && {
								'& > *': {
									border: '1px dashed lightgrey',
									boxSizing: 'border-box',
								},
								'& > *:nth-of-type(-n + ${GRID_COLS})': { borderTop: 'none' },
								'& > *:nth-of-type(n + ${GRID_COLS * (GRID_ROWS - 1) + 1})': { borderBottom: 'none' },
								'& > *:nth-of-type(n+1)': { borderLeft: 'none' },
								'& > *:nth-of-type(${GRID_COLS}n)': { borderRight: 'none' },
							}),
						}}
					>
						{Array.from({ length: totalCells }).map((_, i) => (
							<Box key={i} />
						))}
					</Box>
				)}
			</Box>
		</Box>
	);
};
