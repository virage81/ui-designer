import { useCanvasContext } from '@/contexts/useCanvasContext.ts';
import { GridOverlay } from '@components/GridOverlay/GridOverlay.tsx';
import type { RootState } from '@store/index';
import { Box } from '@mui/material';
import type { PayloadAction } from '@reduxjs/toolkit';
import { useProject } from '@shared/hooks/useProject.tsx';
import { useSaveProjectPreview } from '@shared/hooks/useSavePreview.tsx';
import type { Brush, Circle, Drawable, Line, Rect, Text } from '@shared/types/canvas';
import type { RootState } from '@store/index';
import { addObject, objectsByLayerSelector, removeObject, updateObject } from '@store/slices/canvasSlice';
import { sortedLayersSelector, updateLayer } from '@store/slices/projectsSlice';
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

export const Canvas: React.FC = () => {
	const { id: projectId = '' } = useParams();
	const dispatch = useDispatch();
	const { register, unregister } = useCanvasContext();
	const guides = useSelector((state: RootState) => state.projects.guides);
	const showGrid: boolean = guides.enabled;

	const { activeLayer } = useSelector((state: RootState) => state.projects);
	const { tool, fillColor, strokeWidth, strokeStyle, fontSize } = useSelector((state: RootState) => state.tools);
	const sortedLayers = useSelector((state: RootState) => sortedLayersSelector(state, projectId));
	const zoom = useSelector((state: RootState) => state.projects.zoom);
	const layerObjects = useSelector((state: RootState) => objectsByLayerSelector(state, activeLayer?.id || ''));

	const isTextEditingRef = useRef(false);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvasContainerRef = useRef<HTMLDivElement | null>(null);
	const toolRef = useRef<Tools | null>(null);
	const dprSetupsRef = useRef<Record<string, boolean>>({});
	const canvasesRef = useRef<Record<string, HTMLCanvasElement>>({});

	const isDrawingRef = useRef(false);
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const layerChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const animationFrameRef = useRef<number | null>(null);

	const currentProject = useProject();

	const { canvases } = useCanvasContext();
	const layersByProject = useSelector((state: RootState) => state.projects.layers);
	const projectLayers = useMemo(() => layersByProject[projectId ?? ''] ?? [], [layersByProject, projectId]);
	const saveProjectPreview = useSaveProjectPreview(currentProject, projectLayers, canvases);
	const saveProjectPreviewRef = useRef(saveProjectPreview);

	const [canvasContainerWidth, setCanvasContainerWidth] = useState(currentProject.width);

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
		}, 600);
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
		}, 300);
	}, [isTextEditingRef, saveProjectPreviewRef]);

	const handleToolComplete = useCallback(
		(payload: unknown) => {
			if (!payload || typeof payload !== 'object') return;

			if ('type' in payload) {
				dispatch(addObject(payload as Rect | Circle | Line | Text));
			}
			if ('id' in payload && 'updates' in payload) {
				dispatch(updateObject(payload as PayloadAction<{ id: string; updates: Partial<Drawable> }>['payload']));
			}
			if ('id' in payload && !('type' in payload) && !('updates' in payload)) {
				dispatch(removeObject((payload as { id: string }).id));
			}
		},
		[dispatch],
	);

	const toolOptions = useMemo(
		() => ({
			layerId: activeLayer?.id || '',
			onComplete: handleToolComplete,
			layerObjects,
		}),
		[activeLayer?.id, handleToolComplete, layerObjects],
	);

	const baseStyles = useMemo(
		() => ({
			lineCap: 'round' as CanvasLineCap,
			lineJoin: 'round' as CanvasLineJoin,
			font: `${toolStyles.fontSize}px Arial`,
			lineWidth: toolStyles.strokeWidth,
			fillStyle: toolStyles.fill,
			strokeStyle: toolStyles.strokeStyle,
		}),
		[toolStyles],
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

	useEffect(() => {
		if (!canvasRef.current || !activeLayer) return;

		if (activeLayer.cleared) {
			const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
			if (ctx) {
				ctx.clearRect(0, 0, currentProject.width, currentProject.height);
				dispatch(updateLayer({ projectId, data: { id: activeLayer.id, cleared: false } }));
			}
		}
	}, [activeLayer, projectId, dispatch, currentProject.height, currentProject.width]);

	useEffect(() => {
		if (!canvasRef.current || !activeLayer || !currentProject) return;

		const draw = () => {
			const ctx = canvasRef.current?.getContext('2d');
			if (!ctx) return;

			ctx.clearRect(0, 0, currentProject.width, currentProject.height);

			Object.assign(ctx, baseStyles);

			layerObjects.forEach(obj => {
				switch (obj.type) {
					case 'rect': {
						const r = obj as Rect;
						ctx.fillStyle = r.fill;
						ctx.strokeStyle = r.stroke;
						ctx.lineWidth = r.strokeWidth;
						ctx.beginPath();
						ctx.rect(r.x, r.y, r.width, r.height);
						ctx.fill();
						if (r.strokeWidth > 0) ctx.stroke();
						break;
					}

					case 'circle': {
						const c = obj as Circle;
						ctx.fillStyle = c.fill;
						ctx.strokeStyle = c.stroke;
						ctx.lineWidth = c.strokeWidth;
						ctx.beginPath();
						ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
						ctx.fill();
						if (c.strokeWidth > 0) ctx.stroke();
						break;
					}

					case 'line': {
						const l = obj as Line;
						ctx.strokeStyle = l.stroke;
						ctx.lineWidth = l.strokeWidth;
						ctx.beginPath();
						ctx.moveTo(l.x1, l.y1);
						ctx.lineTo(l.x2, l.y2);
						ctx.stroke();
						break;
					}

					case 'text': {
						const t = obj as Text;
						ctx.fillStyle = t.fill;
						ctx.font = `${t.fontSize}px Arial`;
						ctx.textBaseline = 'top';
						ctx.textAlign = 'left';

						const lines = t.lines || t.text.split('\n');
						const lineHeight = t.fontSize * 1.2;

						for (let i = 0; i < lines.length; i++) {
							const lineY = t.y + i * lineHeight;
							if (lineY > currentProject.height) break;
							ctx.fillText(lines[i], t.x, lineY);
						}
						break;
					}

					case 'brush': {
						const b = obj as Brush;
						if (b.points.length === 0) break;

						ctx.strokeStyle = b.stroke;
						ctx.lineWidth = b.strokeWidth;
						ctx.lineCap = 'round';
						ctx.lineJoin = 'round';

						ctx.beginPath();
						ctx.moveTo(b.points[0].x, b.points[0].y);

						for (let i = 1; i < b.points.length; i++) {
							ctx.lineTo(b.points[i].x, b.points[i].y);
						}

						ctx.stroke();
						break;
					}
					default:
						break;
				}
			});
		};

		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}

		animationFrameRef.current = requestAnimationFrame(draw);

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};

		//eslint-disable-next-line
	}, [layerObjects, activeLayer?.id, currentProject?.width, currentProject?.height]);

	useEffect(() => {
		if (canvasRef.current) {
			setupCanvasDPR(canvasRef.current);
		}
	}, [activeLayer?.id, setupCanvasDPR]);

	useEffect(() => {
		if (canvasContainerRef.current) {
			setCanvasContainerWidth(canvasContainerRef.current.getBoundingClientRect().width);
		}
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
