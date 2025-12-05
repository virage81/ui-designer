import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Button, Menu, MenuItem, Tab, Tabs, Typography } from '@mui/material';
import type { Layer } from '@shared/types/project';
import type { RootState } from '@store/index';
import {
	clearActiveLayer,
	createLayer,
	deleteLayer,
	setActiveLayer,
	sortedLayersSelector,
	updateLayer,
	historySelector,
	addToHistory,
	pointerSelector,
} from '@store/slices/projectsSlice';
import { PlusIcon } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { SortableLayer } from './components';
import { HISTORY_ACTIONS } from '@store/slices/projectsSlice.enums';
import { HistoryItem } from './components/HistoryItem';
import { useThunkDispatch } from '@store/utils/thunkDispatch';
import { debounce, type DebouncedFunc } from 'lodash';
import { captureCanvasAndSaveToHistory } from '@components/Canvas/thunks/captureCanvasSnapshot';
import { redrawCanvas } from '@store/utils/canvasRedraw';

export const RightSideBar: React.FC = () => {
	const dispatch = useDispatch();
	const thunkDispatch = useThunkDispatch();
	const { id: projectId = '' } = useParams();

	const { layers, activeLayer } = useSelector((state: RootState) => state.projects);
	const history = useSelector((state: RootState) => historySelector(state, projectId));
	const pointer = useSelector((state: RootState) => pointerSelector(state, projectId));
	const sortedLayers = useSelector((state: RootState) => sortedLayersSelector(state, projectId));
	const [activeTab, setActiveTab] = useState(0);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [currentLayerId, setCurrentLayerId] = useState<string | null>(null);
	const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
	const [editingLayerName, setEditingLayerName] = useState('');
	const sensors = useSensors(useSensor(PointerSensor));
	const saveSnapshotDebouncedRef = useRef<DebouncedFunc<() => void> | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const currentLayer = sortedLayers.find(l => l.id === currentLayerId) ?? null;
	const isMenuOpen = Boolean(anchorEl);

	/**
	 * полное описание в
	 * @link src/components/Canvas/Canvas.tsx
	 *
	 * @TODO: если реально, вынести это в отдельный файл,
	 * т.к. используется в нескольких местах в приложении
	 */
	useEffect(() => {
		if (!canvasRef.current || !activeLayer) return;

		const saveSnapshot = () => {
			if (!canvasRef.current) return;

			thunkDispatch(
				captureCanvasAndSaveToHistory({
					projectId: projectId,
					layerId: activeLayer.id,
					canvasRef: canvasRef.current,
				}),
			);
		};

		saveSnapshotDebouncedRef.current = debounce(saveSnapshot, 200);

		return () => {
			if (saveSnapshotDebouncedRef.current) {
				saveSnapshotDebouncedRef.current.cancel();
			}
		};
	}, [projectId, activeLayer, thunkDispatch]);

	const handleChange = (_: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	// тут обновляем слой (прячем или прозрачность) и добавляем это событие в историю
	const handleUpdateLayer = (name: keyof Layer, value: unknown, layerId: string) => {
		if (!projectId) return;

		dispatch(updateLayer({ projectId: projectId, data: { id: layerId, [name]: value } }));

		dispatch(
			addToHistory({
				projectId,
				type: name === 'opacity' ? HISTORY_ACTIONS.LAYER_OPACITY : HISTORY_ACTIONS.LAYER_HIDE,
			}),
		);

		if (saveSnapshotDebouncedRef.current) {
			saveSnapshotDebouncedRef.current();
		}
	};

	// тут очищаем слой и добавляем это событие в историю
	const handleClearLayer = () => {
		if (!projectId) return;
		if (currentLayer) {
			dispatch(
				clearActiveLayer({
					projectId: projectId,
					layerId: currentLayer.id,
				}),
			);

			dispatch(
				addToHistory({
					projectId,
					type: HISTORY_ACTIONS.LAYER_CLEAR,
				}),
			);

			if (saveSnapshotDebouncedRef.current) {
				saveSnapshotDebouncedRef.current();
			}
		}
		handleCloseMenu();
	};

	const handleRenameLayer = (layer: Layer) => {
		if (!projectId) return;
		handleCloseMenu();
		setTimeout(() => {
			startEditing(layer.id, layer.name);
		}, 0);
	};

	// тут удаляем слой и добавляем это событие в историю
	const handleDelete = (layerId: Layer['id']) => {
		dispatch(deleteLayer({ id: layerId, projectId: projectId }));
		dispatch(
			addToHistory({
				projectId,
				type: HISTORY_ACTIONS.LAYER_DELETE,
			}),
		);

		if (layerId === activeLayer?.id) {
			dispatch(setActiveLayer({ projectId, id: layers[projectId][0].id }));
		}
	};

	// тут "делаем" активным слой и добавляем это событие в историю
	const handleLayerClick = (id: string) => {
		if (id === activeLayer?.id) return;

		if (!editingLayerId) {
			dispatch(setActiveLayer({ projectId, id }));

			dispatch(
				addToHistory({
					projectId,
					type: HISTORY_ACTIONS.LAYER_ACTIVE,
				}),
			);
		}
	};

	const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>, layerId?: string) => {
		setAnchorEl(event.currentTarget);
		setCurrentLayerId(layerId ?? null);
	};
	const handleCloseMenu = () => {
		setAnchorEl(null);
		setCurrentLayerId(null);
	};

	const startEditing = (layerId: string, currentName: string) => {
		setEditingLayerId(layerId);
		setEditingLayerName(currentName);
	};

	// тут переименовываем слой и добавляем это событие в историю
	const saveLayerName = (layerId: string) => {
		if (!projectId) return;
		dispatch(
			updateLayer({
				projectId,
				data: { id: layerId, name: editingLayerName.trim() || 'Без имени' },
			}),
		);
		dispatch(
			addToHistory({
				projectId,
				type: HISTORY_ACTIONS.LAYER_RENAME,
			}),
		);
		setEditingLayerId(null);
		setEditingLayerName('');
	};

	const cancelEditing = () => {
		setEditingLayerId(null);
		setEditingLayerName('');
	};

	// тут мменяем порядок слоёв и добавляем это событие в историю
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = sortedLayers.findIndex(l => l.id === active.id);
		const newIndex = sortedLayers.findIndex(l => l.id === over.id);
		const newLayers = arrayMove(sortedLayers, oldIndex, newIndex);

		newLayers.forEach((layer, index) => {
			dispatch(updateLayer({ projectId, data: { id: layer.id, zIndex: newLayers.length - index } }));
		});
		dispatch(
			addToHistory({
				projectId,
				type: HISTORY_ACTIONS.LAYER_ORDER,
			}),
		);
	};

	useEffect(() => {
		if (!projectId || !canvasRef.current) return;

		// тут перерисовываем canvas
		redrawCanvas(canvasRef.current, sortedLayers);
	}, [projectId, sortedLayers, pointer]);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				width: 320,
				borderLeft: '1px solid',
				borderColor: 'var(--header-border-color)',
			}}>
			<Tabs value={activeTab} onChange={handleChange}>
				<Tab label='Слои' sx={{ width: '50%' }} />
				<Tab label='История' sx={{ width: '50%' }} />
			</Tabs>

			<Box
				sx={{
					flex: 1,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					p: 1,
					color: 'var(--color)',
					backgroundColor: 'var(--header-bg)',
				}}>
				{activeTab === 0 && (
					<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '36px' }}>
							<Typography variant='subtitle2'>Слои</Typography>
							<Button
								variant='tools'
								sx={{ padding: '10px' }}
								onClick={() => {
									if (!projectId) return;
									// тут добавляем слой и это событие в историю
									dispatch(
										createLayer({
											projectId: projectId,
											data: {
												hidden: false,
												name: 'Новый слой',
												opacity: 100,
												zIndex: layers[projectId].length + 1,
											},
										}),
									);
									dispatch(
										addToHistory({
											projectId,
											type: HISTORY_ACTIONS.LAYER_ADD,
										}),
									);
									if (saveSnapshotDebouncedRef.current) {
										saveSnapshotDebouncedRef.current();
									}
								}}>
								<PlusIcon size={16} color='var(--color)' />
							</Button>
						</Box>

						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
							<SortableContext items={sortedLayers.map(l => l.id)} strategy={verticalListSortingStrategy}>
								<Box
									sx={{
										overflowY: 'auto',
										'&::-webkit-scrollbar': {
											width: '6px',
										},
										'&::-webkit-scrollbar-track': {
											background: 'transparent',
										},
										'&::-webkit-scrollbar-thumb': {
											backgroundColor: 'rgba(0,0,0,0.2)',
											borderRadius: '3px',
										},
										'&::-webkit-scrollbar-thumb:hover': {
											backgroundColor: 'rgba(0,0,0,0.3)',
										},
									}}>
									{sortedLayers.map(layer => (
										<SortableLayer
											key={layer.id}
											layer={layer}
											isActive={layer.id === activeLayer?.id}
											editingLayerId={editingLayerId}
											editingLayerName={editingLayerName}
											startEditing={startEditing}
											saveLayerName={saveLayerName}
											cancelEditing={cancelEditing}
											handleUpdateLayer={handleUpdateLayer}
											handleOpenMenu={handleOpenMenu}
											handleLayerClick={handleLayerClick}
										/>
									))}
								</Box>
							</SortableContext>
						</DndContext>
					</Box>
				)}
				<Menu
					anchorEl={anchorEl}
					open={isMenuOpen}
					onClose={handleCloseMenu}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
					<MenuItem
						onClick={() => {
							if (currentLayer) {
								handleRenameLayer(currentLayer);
							}
						}}>
						Переименовать
					</MenuItem>

					<MenuItem onClick={handleClearLayer}>Очистить</MenuItem>

					{currentLayer && (
						<MenuItem
							onClick={() => {
								handleDelete(currentLayer.id);
								handleCloseMenu();
							}}>
							Удалить
						</MenuItem>
					)}
				</Menu>

				{activeTab === 1 && (
					<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', minHeight: '36px' }}>
							<Typography variant='subtitle2'>История действий</Typography>
						</Box>

						<Box
							sx={{
								overflowY: 'auto',

								'&::-webkit-scrollbar': {
									width: '6px',
								},
								'&::-webkit-scrollbar-track': {
									background: 'transparent',
								},
								'&::-webkit-scrollbar-thumb': {
									backgroundColor: 'rgba(0,0,0,0.2)',
									borderRadius: '3px',
								},
								'&::-webkit-scrollbar-thumb:hover': {
									backgroundColor: 'rgba(0,0,0,0.3)',
								},
							}}>
							{history.map((_, idx) => {
								const reversedIndex = history.length - 1 - idx;
								const el = history[reversedIndex];

								return el && el.id !== '' ? (
									<HistoryItem key={el.id} {...el} index={reversedIndex} isActive={pointer >= reversedIndex} />
								) : null;
							})}
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	);
};
