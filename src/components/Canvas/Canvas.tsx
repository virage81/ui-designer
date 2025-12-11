import type { RootState } from '@store/index';
import {
	addToHistory,
	historySelector,
	isHistoryActiveSelector,
	layersSelector,
	pointerSelector,
	setHistoryActivity,
	sortedLayersSelector,
} from '@store/slices/projectsSlice';
import { useCanvasContext } from '@/contexts/useCanvasContext.ts';
import { GridOverlay } from '@components/GridOverlay/GridOverlay';
import { Box } from '@mui/material';
import type { PayloadAction } from '@reduxjs/toolkit';
import { useProject } from '@shared/hooks/useProject.tsx';
import { useSaveProjectPreview } from '@shared/hooks/useSavePreview.tsx';
import type { Brush, Circle, Drawable, Line, Rect, Text } from '@shared/types/canvas';
import {
	addObject,
	objectsByLayerSelector,
	objectsByProjectSelector,
	removeInactiveLayerObjects,
	updateObject,
} from '@store/slices/canvasSlice';
import { ACTIONS } from '@store/slices/toolsSlice';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redirect, useParams } from 'react-router-dom';
import { BrushTool } from './tools/Brush';
import { CircleTool } from './tools/Circle';
import { EraserTool } from './tools/Eraser';
import { LineTool } from './tools/Line';
import { RectangleTool } from './tools/Rect';
import { SelectTool } from './tools/Select';
import { TextTool } from './tools/Text';
import type { Styles, Tools } from './tools/Tool';
import { redrawCanvases } from './utils/redrawCanvases';

export const Canvas: React.FC = () => {
	const { id: projectId = '' } = useParams();
	const dispatch = useDispatch();
	const guides = useSelector((state: RootState) => state.projects.guides);
	const { activeLayer } = useSelector((state: RootState) => state.projects);
	const { tool, fillColor, strokeWidth, strokeStyle, fontSize } = useSelector((state: RootState) => state.tools);
	const sortedLayers = useSelector((state: RootState) => sortedLayersSelector(state, projectId));
	const history = useSelector((state: RootState) => historySelector(state, projectId));
	const pointer = useSelector((state: RootState) => pointerSelector(state, projectId));
	const isHistoryActive = useSelector((state: RootState) => isHistoryActiveSelector(state, projectId));
	const activeLayers = useSelector((state: RootState) => layersSelector(state, projectId));
	const zoom = useSelector((state: RootState) => state.projects.zoom);
	const layerObjects = useSelector((state: RootState) => objectsByLayerSelector(state, activeLayer?.id || ''));
	const projectObjects = useSelector((state: RootState) => objectsByProjectSelector(state, projectId));
	const layersByProject = useSelector((state: RootState) => state.projects.layers);

	const isTextEditingRef = useRef(false);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvasContainerRef = useRef<HTMLDivElement | null>(null);
	const toolRef = useRef<Tools | null>(null);
	const dprSetupsRef = useRef<Record<string, boolean>>({});
	const canvasesRef = useRef<Record<string, HTMLCanvasElement>>({});
	const isDrawingRef = useRef(false);
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const layerChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const currentProject = useProject();
	const { canvases } = useCanvasContext();
	const { register, unregister } = useCanvasContext();
	const projectLayers = useMemo(() => layersByProject[projectId ?? ''] ?? [], [layersByProject, projectId]);
	const saveProjectPreview = useSaveProjectPreview(currentProject, projectLayers, canvases);
	const saveProjectPreviewRef = useRef(saveProjectPreview);
	const initialRenderRef = useRef(false);

	// @TODO: внедрить в существующую рисовку
	// const animationFrameRef = useRef<number | null>(null);

	const [canvasContainerWidth, setCanvasContainerWidth] = useState(currentProject.width);

	const showGrid: boolean = guides.enabled;

	const toolStyles = useMemo<Styles>(
		() => ({ fill: fillColor, strokeWidth, strokeStyle, fontSize }),
		[fillColor, strokeWidth, strokeStyle, fontSize],
	);

	const setupCanvasDPR = useCallback(
		(canvas: HTMLCanvasElement) => {
			if (!canvas || dprSetupsRef.current[canvas.id]) return;

			const dpr = window.devicePixelRatio || 1;

			canvas.width = currentProject.width * dpr;
			canvas.height = currentProject.height * dpr;

			canvas.style.width = `${currentProject.width}px`;
			canvas.style.height = `${currentProject.height}px`;

			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			if (ctx) {
				ctx.scale(dpr, dpr);
				ctx.imageSmoothingEnabled = false;
			}

			dprSetupsRef.current[canvas.id] = true;
		},
		[currentProject.width, currentProject.height],
	);

	const triggerDrawingSave = useCallback(() => {
		if (isTextEditingRef.current) {
			if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
			return;
		}

		if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

		saveTimeoutRef.current = setTimeout(() => {
			if (!isDrawingRef.current && !isTextEditingRef.current) {
				saveProjectPreviewRef.current();
			}
		}, 30000);
	}, [isTextEditingRef, saveProjectPreviewRef]);

	const triggerLayerSave = useCallback(() => {
		if (isTextEditingRef.current) {
			if (layerChangeTimeoutRef.current) clearTimeout(layerChangeTimeoutRef.current);
			return;
		}

		if (layerChangeTimeoutRef.current) clearTimeout(layerChangeTimeoutRef.current);

		layerChangeTimeoutRef.current = setTimeout(() => {
			if (!isTextEditingRef.current) {
				saveProjectPreviewRef.current();
			}
		}, 30000);
	}, [isTextEditingRef, saveProjectPreviewRef]);

	const handleToolComplete = useCallback(
		(payload: unknown) => {
			if (!payload || typeof payload !== 'object' || !('type' in payload)) return;

			switch ((payload as Brush | Rect | Circle | Line | Text).type) {
				case 'brush':
					dispatch(addObject(payload as Rect));
					break;
				case 'rect':
					dispatch(addObject(payload as Rect));
					break;
				case 'circle':
					dispatch(addObject(payload as Circle));
					break;
				case 'line':
					dispatch(addObject(payload as Line));
					break;
				case 'text':
					dispatch(addObject(payload as Text));
					break;
				default:
					if ('id' in payload && 'updates' in payload) {
						dispatch(updateObject(payload as PayloadAction<{ id: string; updates: Partial<Drawable> }>['payload']));
					}
				// Тут не будем удалять объекты -> они всё ещё есть в истории
				// else if ('id' in payload) {
				// dispatch(removeObject((payload as { id: string }).id));
				// dispatch(clearObject);
				// }
			}

			if (activeLayer) {
				if (isHistoryActive) {
					dispatch(removeInactiveLayerObjects({ layers: activeLayers }));
				}

				dispatch(
					addToHistory({
						projectId: projectId,
						activeLayer,
						type: tool,
					}),
				);
			}
		},
		[projectId, activeLayer, tool, dispatch, isHistoryActive, activeLayers],
	);

	const snapToGrid = useCallback(
		(x: number, y: number): [number, number] => {
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
		},
		[guides, currentProject],
	);

	const toolOptions = useMemo(
		() => ({
			layerId: activeLayer?.id || '',
			onComplete: handleToolComplete,
			layerObjects,
			projectId: projectId,
			pointer: pointer + 1,
		}),
		[activeLayer, handleToolComplete, layerObjects, projectId, pointer],
	);

	// @TODO: внедрить в существующую рисовку
	// const baseStyles = useMemo(
	// 	() => ({
	// 		lineCap: 'round' as CanvasLineCap,
	// 		lineJoin: 'round' as CanvasLineJoin,
	// 		font: `${toolStyles.fontSize}px Arial`,
	// 		lineWidth: toolStyles.strokeWidth,
	// 		fillStyle: toolStyles.fill,
	// 		strokeStyle: toolStyles.strokeStyle,
	// 	}),
	// 	[toolStyles],
	// );

	useEffect(() => {
		dispatch(
			setHistoryActivity({
				projectId: projectId,
				status: false,
			}),
		);
	}, [projectId, dispatch]);

	useEffect(() => {
		saveProjectPreviewRef.current = saveProjectPreview;
	}, [saveProjectPreview]);

	useEffect(() => {
		const handlePointerDown = () => {
			isDrawingRef.current = true;
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
				saveTimeoutRef.current = null;
			}
			if (layerChangeTimeoutRef.current) {
				clearTimeout(layerChangeTimeoutRef.current);
				layerChangeTimeoutRef.current = null;
			}
		};

		const handlePointerUp = () => {
			isDrawingRef.current = false;
			triggerDrawingSave();
		};

		const currentCanvases = canvasesRef.current;
		Object.values(currentCanvases).forEach(canvas => {
			canvas.addEventListener('pointerdown', handlePointerDown);
			canvas.addEventListener('pointerup', handlePointerUp);
		});

		return () => {
			Object.values(currentCanvases).forEach(canvas => {
				canvas.removeEventListener('pointerdown', handlePointerDown);
				canvas.removeEventListener('pointerup', handlePointerUp);
			});
			if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
			if (layerChangeTimeoutRef.current) clearTimeout(layerChangeTimeoutRef.current);
		};
	}, [triggerDrawingSave]);

	useEffect(() => {
		triggerLayerSave();
	}, [tool, projectLayers, triggerLayerSave]);

	useEffect(() => {
		if (toolRef.current) {
			toolRef.current.destroyEvents();
			toolRef.current = null;
		}

		if (!canvasRef.current || !canvasContainerRef.current || !activeLayer || !currentProject.id) return;

		switch (tool) {
			case ACTIONS.SELECT: {
				toolRef.current = new SelectTool(canvasRef.current, toolStyles, toolOptions, zoom);
				break;
			}
			case ACTIONS.BRUSH: {
				toolRef.current = new BrushTool(canvasRef.current, toolStyles, toolOptions, zoom, snapToGrid);
				break;
			}
			case ACTIONS.RECTANGLE: {
				toolRef.current = new RectangleTool(canvasRef.current, toolStyles, toolOptions, zoom, snapToGrid);
				break;
			}
			case ACTIONS.CIRCLE: {
				toolRef.current = new CircleTool(canvasRef.current, toolStyles, toolOptions, zoom, snapToGrid);
				break;
			}
			case ACTIONS.LINE: {
				toolRef.current = new LineTool(canvasRef.current, toolStyles, toolOptions, zoom, snapToGrid);
				break;
			}
			case ACTIONS.ERASER: {
				toolRef.current = new EraserTool(canvasRef.current, toolStyles, toolOptions, zoom);
				break;
			}
			case ACTIONS.TEXT: {
				toolRef.current = new TextTool(
					canvasRef.current,
					toolStyles,
					toolOptions,
					zoom,
					isTextEditingRef,
					canvasContainerRef.current,
					snapToGrid,
				);
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
		//eslint-disable-next-line
	}, [tool, activeLayer, toolStyles, currentProject.id, layerObjects, zoom, canvasContainerRef, snapToGrid]);

	// Тут увеличиваем DPR теперь у всех слоёв
	useEffect(() => {
		Object.values(canvasesRef.current).forEach(canvas => {
			setupCanvasDPR(canvas);
		});
	}, [currentProject.width, currentProject.height, setupCanvasDPR, activeLayer?.id]);

	useEffect(() => {
		if (canvasContainerRef.current) {
			setCanvasContainerWidth(canvasContainerRef.current.getBoundingClientRect().width);
		}
	}, []);

	// Тут перерисовываем canvas
	useEffect(() => {
		if (!canvasRef.current || !history) return;

		if (!initialRenderRef.current || isHistoryActive) {
			redrawCanvases(canvasesRef.current, projectObjects, pointer);
			initialRenderRef.current = true;
		}
	}, [history, pointer, isHistoryActive, projectObjects]);

	if (!currentProject) {
		redirect('/404');
		return null;
	}

	return (
		<Box
			sx={{
				width: '100%',
				padding: '8px',
				backgroundColor: 'var(--main-bg)',
				overflow: 'auto',
			}}>
			<Box
				ref={canvasContainerRef}
				sx={{
					position: 'relative',
					m: `${currentProject.width * zoom <= canvasContainerWidth ? '0 auto' : '0'}`,
					width: currentProject.width,
					height: currentProject.height,
					cursor: tool !== ACTIONS.SELECT ? 'crosshair' : 'auto',
					boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.1)',
					transform: `scale(${zoom})`,
					transformOrigin: `${currentProject.width * zoom <= canvasContainerWidth ? 'top center' : 'top left'}`,
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
				{showGrid && <GridOverlay guides={guides} />}
				{sortedLayers.map(layer => (
					<canvas
						id={layer.id}
						key={layer.id}
						ref={el => {
							if (el) {
								canvasesRef.current[layer.id] = el;
								if (layer.id === activeLayer?.id) {
									canvasRef.current = el;
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
