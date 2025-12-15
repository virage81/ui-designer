import { useCanvasContext } from '@/contexts/useCanvasContext';
import { GridOverlay } from '@components/GridOverlay/GridOverlay';
import { Box } from '@mui/material';
import type { PayloadAction } from '@reduxjs/toolkit';
import { useProject } from '@shared/hooks/useProject';
import { useSaveProjectPreview } from '@shared/hooks/useSavePreview';
import type { Drawable } from '@shared/types/canvas';
import type { RootState } from '@store/index';
import {
	addCanvasObject,
	addToHistory,
	canvasObjectsByLayerSelector,
	historySelector,
	isHistoryActiveSelector,
	pointerSelector,
	removeCanvasObject,
	sortedLayersSelector,
	updateCanvasObject,
} from '@store/slices/projectsSlice';
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
import { renderLayerObjects } from './utils/renderLayerObjects';

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
	const zoom = useSelector((state: RootState) => state.projects.zoom);
	const layerObjects = useSelector((state: RootState) => canvasObjectsByLayerSelector(state, activeLayer?.id || ''));
	const allObjects = useSelector((state: RootState) => state.projects.canvasObjects);
	const layersByProject = useSelector((state: RootState) => state.projects.layers);

	const isTextEditingRef = useRef(false);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvasContainerRef = useRef<HTMLDivElement | null>(null);
	const textareaContainerRef = useRef<HTMLDivElement | null>(null);
	const toolRef = useRef<Tools | null>(null);
	const dprSetupsRef = useRef<Record<string, boolean>>({});
	const canvasesRef = useRef<Record<string, HTMLCanvasElement>>({});
	const isCtrlPressedRef = useRef(false);
	const isDrawingRef = useRef(false);
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const layerChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const currentProject = useProject();
	const { canvases } = useCanvasContext();
	const { register, unregister } = useCanvasContext();
	const projectLayers = useMemo(() => layersByProject[projectId ?? ''] ?? [], [layersByProject, projectId]);
	const saveProjectPreview = useSaveProjectPreview(currentProject, projectLayers, canvases);
	const saveProjectPreviewRef = useRef(saveProjectPreview);
	// const animationFrameRef = useRef<number | null>(null);
	// const initialRenderRef = useRef(false);

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
			if (!isDrawingRef.current) {
				saveProjectPreviewRef.current();
			}
			if (!isDrawingRef.current && !isTextEditingRef.current) {
				saveProjectPreviewRef.current();
			}
		}, 30000);
		// }, [saveProjectPreviewRef]);
	}, [isTextEditingRef, saveProjectPreviewRef]);

	const triggerLayerSave = useCallback(() => {
		if (isTextEditingRef.current) {
			if (layerChangeTimeoutRef.current) clearTimeout(layerChangeTimeoutRef.current);
			return;
		}

		if (layerChangeTimeoutRef.current) clearTimeout(layerChangeTimeoutRef.current);

		layerChangeTimeoutRef.current = setTimeout(() => {
			saveProjectPreviewRef.current();
			if (!isTextEditingRef.current) {
				saveProjectPreviewRef.current();
			}
		}, 30000);
		// }, [saveProjectPreviewRef]);
	}, [isTextEditingRef, saveProjectPreviewRef]);

	const handleToolComplete = useCallback(
		(payload: unknown) => {
			if (!payload || typeof payload !== 'object') return;

			if ('type' in payload) {
				dispatch(addCanvasObject(payload as Drawable));
			}
			if ('id' in payload && 'updates' in payload) {
				dispatch(updateCanvasObject(payload as PayloadAction<{ id: string; updates: Partial<Drawable> }>['payload']));
			}
			if ('id' in payload && !('type' in payload) && !('updates' in payload)) {
				dispatch(removeCanvasObject((payload as { id: string }).id));
			}

			if (activeLayer && projectId) {
				dispatch(
					addToHistory({
						projectId,
						activeLayer,
						type: tool,
						canvasDataURL: '',
					}),
				);
			}
		},
		[projectId, activeLayer, tool, dispatch],
	);

	const toolOptions = useMemo(
		() => ({
			layerId: activeLayer?.id || '',
			onComplete: handleToolComplete,
			layerObjects,
		}),
		[activeLayer?.id, handleToolComplete, layerObjects],
	);

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

	const snapToGrid = useCallback(
		(x: number, y: number): [number, number] => {
			if (!guides.enabled || !isCtrlPressedRef.current) return [x, y];

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

	useEffect(() => {
		if (toolRef.current) {
			toolRef.current.destroyEvents();
			toolRef.current = null;
		}

		if (!canvasRef.current || !textareaContainerRef.current || !activeLayer || !currentProject.id) return;

		switch (tool) {
			case ACTIONS.SELECT: {
				toolRef.current = new SelectTool(
					canvasRef.current,
					toolStyles,
					toolOptions,
					zoom,
					snapToGrid,
					guides,
					isCtrlPressedRef,
				);
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
					textareaContainerRef.current,
					snapToGrid,
					guides,
					isCtrlPressedRef,
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
	}, [tool, activeLayer, toolStyles, currentProject.id, layerObjects, zoom, textareaContainerRef, snapToGrid]);

	// эффект для SelectTool
	useEffect(() => {
		if (toolRef.current instanceof SelectTool) {
			const historyObjects = history[pointer].objects || [];

			// Передаём ТОЛЬКО актуальные объекты активного слоя из истории
			const activeLayerObjects = historyObjects.filter(obj => obj.layerId === activeLayer?.id);

			toolRef.current.updateLayerObjects(activeLayerObjects);
		}
	}, [activeLayer?.id, tool, history, pointer]);

	// // Тут перерисовываем canvas
	// useEffect(() => {
	// 	if (!canvasRef.current || !history) return;

	// 	if (!initialRenderRef.current || isHistoryActive) {
	// 		history[pointer].layers.forEach(l => {
	// 			redrawCanvas(canvasesRef.current[l.id], l.canvasDataURL);
	// 		});

	// 		initialRenderRef.current = true;
	// 	}
	// }, [history, pointer, isHistoryActive]);

	// Перерисовка canvas через векторный рендер по объектам
	useEffect(() => {
		if (!currentProject || !canvasesRef.current || !sortedLayers) return;

		sortedLayers.forEach(layer => {
			const canvas = canvasesRef.current[layer.id];
			if (!canvas) return;

			let objectsToRender: Drawable[] = [];

			if (isHistoryActive && history && history[pointer]) {
				const historyObjects = history[pointer].objects || [];
				objectsToRender = historyObjects.filter(obj => obj.layerId === layer.id);
			} else {
				objectsToRender = allObjects.filter(obj => obj.layerId === layer.id);
			}

			renderLayerObjects(canvas, objectsToRender);
		});

		// TODO: можно через requestAnimationFrame, но тогда не будет анимации
		// const renderFrame = () => {
		// 	const dpr = window.devicePixelRatio || 1;

		// 	sortedLayers.forEach(layer => {
		// 		const canvas = canvasesRef.current[layer.id];
		// 		if (!canvas) return;

		// 		let objectsToRender: Drawable[] = [];

		// 		if (isHistoryActive && history && history[pointer]) {
		// 			const historyObjects = history[pointer].objects || [];
		// 			objectsToRender = historyObjects.filter(obj => obj.layerId === layer.id);
		// 		} else {
		// 			objectsToRender = allObjects.filter(obj => obj.layerId === layer.id);
		// 		}

		// 		renderLayerObjects(canvas, objectsToRender, dpr);
		// 	});

		// 	// Запрашиваем следующий кадр анимации
		// 	animationFrameRef.current = requestAnimationFrame(renderFrame);
		// };

		// // Отменяем предыдущий кадр анимации
		// if (animationFrameRef.current) {
		// 	cancelAnimationFrame(animationFrameRef.current);
		// }

		// // Запускаем рендеринг
		// animationFrameRef.current = requestAnimationFrame(renderFrame);

		// return () => {
		// 	if (animationFrameRef.current) {
		// 		cancelAnimationFrame(animationFrameRef.current);
		// 	}
		// };
	}, [allObjects, sortedLayers, currentProject, isHistoryActive, history, pointer, projectId]);

	useEffect(() => {
		if (canvasRef.current) {
			setupCanvasDPR(canvasRef.current);
		}
	}, [activeLayer?.id, setupCanvasDPR]);

	useEffect(() => {
		const canvasContainer = canvasContainerRef.current;
		if (!canvasContainer) return;

		const preventContextMenu = (e: Event) => e.preventDefault();
		canvasContainer.addEventListener('contextmenu', preventContextMenu);

		canvasContainer.addEventListener('selectstart', preventContextMenu);
		canvasContainer.addEventListener('controlselect', preventContextMenu);

		return () => {
			canvasContainer.removeEventListener('contextmenu', preventContextMenu);
			canvasContainer.removeEventListener('selectstart', preventContextMenu);
			canvasContainer.removeEventListener('controlselect', preventContextMenu);
		};
	}, []);

	useEffect(() => {
		if (canvasContainerRef.current) {
			setCanvasContainerWidth(canvasContainerRef.current.getBoundingClientRect().width);
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Control') {
				e.preventDefault();
				isCtrlPressedRef.current = true;
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'Control') {
				e.preventDefault();
				isCtrlPressedRef.current = false;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	if (!currentProject) {
		redirect('/404');
		return null;
	}

	return (
		<Box
			ref={canvasContainerRef}
			sx={{
				width: '100%',
				padding: '8px',
				backgroundColor: 'var(--main-bg)',
				overflow: 'auto',
			}}>
			<Box
				ref={textareaContainerRef}
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
									setupCanvasDPR(el);
								}
								register(layer.id, el);
							} else {
								delete canvasesRef.current[layer.id];
								unregister(layer.id);
							}
						}}
						width={`${currentProject.width}px`}
						height={`${currentProject.height}px`}
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
