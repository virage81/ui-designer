import { Box } from '@mui/material';
import type { RootState } from '@store/index';
import { addToHistory, historySelector, pointerSelector, sortedLayersSelector } from '@store/slices/projectsSlice';
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
import { captureCanvasAndSaveToHistory } from './thunks/captureCanvasSnapshot';
import { redrawCanvas } from '@store/utils/canvasRedraw';
import { useThunkDispatch } from '@store/utils/thunkDispatch';
import { useCanvasContext } from '@/contexts/useCanvasContext.ts';
import { useSaveProjectPreview } from '@shared/hooks/useSavePreview.tsx';
import { useProject } from '@shared/hooks/useProject.tsx';

export const Canvas: React.FC = () => {
	const { id: projectId = '' } = useParams();
	const dispatch = useDispatch();
	const { register, unregister } = useCanvasContext();

	/**
	 * Тут более специфичный вид dispatch для captureCanvasAndSaveToHistory;
	 */
	const thunkDispatch = useThunkDispatch();

	const { activeLayer } = useSelector((state: RootState) => state.projects);
	const { tool, fillColor, strokeWidth, strokeStyle, fontSize } = useSelector((state: RootState) => state.tools);
	const sortedLayers = useSelector((state: RootState) => sortedLayersSelector(state, projectId));
	const history = useSelector((state: RootState) => historySelector(state, projectId, activeLayer));
	const pointer = useSelector((state: RootState) => pointerSelector(state, projectId, activeLayer));
	const zoom = useSelector((state: RootState) => state.projects.zoom);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const toolRef = useRef<Tools | null>(null);
	const dprSetupsRef = useRef<Record<string, boolean>>({});
	const canvasesRef = useRef<Record<string, HTMLCanvasElement>>({});

	const currentProject = useProject();

	const { canvases } = useCanvasContext();
	const layersByProject = useSelector((state: RootState) => state.projects.layers);
	const projectLayers = layersByProject[projectId ?? ''] ?? [];
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

	useEffect(() => {
		if (toolRef.current) {
			toolRef.current.destroyEvents();
			toolRef.current = null;
		}

		if (!canvasRef.current || !activeLayer || !currentProject.id) return;

		switch (tool) {
			case ACTIONS.BRUSH: {
				toolRef.current = new BrushTool(canvasRef.current, toolStyles, zoom);
				break;
			}
			case ACTIONS.RECTANGLE: {
				toolRef.current = new RectangleTool(canvasRef.current, toolStyles, zoom);
				break;
			}
			case ACTIONS.CIRCLE: {
				toolRef.current = new CircleTool(canvasRef.current, toolStyles, zoom);
				break;
			}
			case ACTIONS.LINE: {
				toolRef.current = new LineTool(canvasRef.current, toolStyles, zoom);
				break;
			}
			case ACTIONS.ERASER: {
				toolRef.current = new EraserTool(canvasRef.current, toolStyles, zoom);
				break;
			}
			case ACTIONS.TEXT: {
				toolRef.current = new TextTool(canvasRef.current, toolStyles, zoom);
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
	}, [tool, activeLayer, toolStyles, currentProject.id, zoom]);

	useEffect(() => {
		if (canvasRef.current) {
			setupCanvasDPR(canvasRef.current);
		}
	}, [activeLayer?.id, setupCanvasDPR]);

	// Тут перерисовываем canvas
	useEffect(() => {
		if (!projectId || !canvasRef.current) return;

		if (history?.length && pointer !== undefined) {
			const currentLayerData = history[pointer]?.canvasData;

			redrawCanvas(canvasRef.current, currentLayerData);
		}
	}, [projectId, sortedLayers, history, pointer]);

	/**
	 * чтобы добавить canvasDataURL (snapshot) в историю,
	 * нужно снять snapshot canvas в момент записи в историю
	 */
	const handleCanvasDraw = () => {
		const canvas = canvasRef.current;
		if (!canvas || !projectId || !activeLayer) return;

		dispatch(
			addToHistory({
				projectId: projectId,
				layerId: activeLayer.id,
				type: tool,
			}),
		);

		/**
		 * Тут более специфичный вид dispatch с чёткой типизацией;
		 * без этого dispatch "знает" только про обычные экшены
		 * и не "видит" thunk‑и и другие асинхронные экшены
		 */
		thunkDispatch(
			// это middleware для слайса - внутри сохранение изображения слоя в строку и в параметр слоя canvasDataURL
			captureCanvasAndSaveToHistory({
				projectId: projectId,
				layerId: activeLayer.id,
				canvasRef: canvasRef.current,
			}),
		);
	};

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
					transformOrigin: `${zoom <= 1 ? '50% 20%' : 'top left'}`,
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
						onMouseUp={handleCanvasDraw}
					/>
				))}
			</Box>
		</Box>
	);
};
