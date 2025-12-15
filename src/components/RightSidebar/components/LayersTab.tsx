import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import type { Layer } from '@shared/types/project';
import type { RootState } from '@store/index';
import { clearLayerCanvas } from '@store/slices/canvasSlice';
import {
	addToHistory,
	clearActiveLayer,
	createLayer,
	deleteLayer,
	setActiveLayer,
	sortedLayersSelector,
	updateLayer,
} from '@store/slices/projectsSlice';
import { PlusIcon } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { SortableLayer } from '../components';
import { HISTORY_ACTIONS } from '@store/slices/projectsSlice.enums';

export const LayersTab = () => {
	const dispatch = useDispatch();
	const { id: projectId = '' } = useParams();

	const { layers, activeLayer } = useSelector((state: RootState) => state.projects);
	const sortedLayers = useSelector((state: RootState) => sortedLayersSelector(state, projectId));

	const sensors = useSensors(useSensor(PointerSensor));

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [currentLayerId, setCurrentLayerId] = useState<string | null>(null);
	const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
	const [editingLayerName, setEditingLayerName] = useState('');

	const currentLayer = sortedLayers.find(l => l.id === currentLayerId) ?? null;
	const isMenuOpen = Boolean(anchorEl);

	/**
	 * Тут обновляем слой (скрываем его или меняем прозрачность)
	 * и добавляем это событие в историю
	 */
	const handleUpdateLayer = (name: keyof Layer, value: unknown, layerId: string) => {
		if (!projectId) return;

		dispatch(
			updateLayer({
				projectId: projectId,
				data: {
					id: layerId,
					[name]: value,
				},
				canvasDataURL: activeLayer ? activeLayer.canvasDataURL : '',
			}),
		);

		if (activeLayer) {
			dispatch(
				addToHistory({
					projectId: projectId,
					activeLayer,
					type: name === 'opacity' ? HISTORY_ACTIONS.LAYER_OPACITY : HISTORY_ACTIONS.LAYER_HIDE,
					canvasDataURL: activeLayer.canvasDataURL,
				}),
			);
		}
	};

	// Тут очищаем слой и добавляем это событие в историю
	const handleClearLayer = () => {
		if (!projectId) return;
		if (currentLayer) {
			dispatch(
				clearActiveLayer({
					projectId: projectId,
					layerId: currentLayer.id,
				}),
			);
			dispatch(clearLayerCanvas(activeLayer?.id ?? ''));
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

	// Тут удаляем слой и добавляем это событие в историю
	const handleDelete = (layerId: Layer['id']) => {
		dispatch(deleteLayer({ id: layerId, projectId: projectId, activeLayer }));

		if (layerId === activeLayer?.id) {
			dispatch(setActiveLayer({ projectId, id: layers[projectId][0].id }));
		}
	};

	// Тут "делаем" активным слой и добавляем это событие в историю
	const handleLayerClick = (id: string) => {
		if (id === activeLayer?.id) return;

		if (!editingLayerId) {
			dispatch(setActiveLayer({ projectId, id }));
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

	// Тут переименовываем слой и добавляем это событие в историю
	const saveLayerName = (layerId: string) => {
		if (!projectId) return;
		dispatch(
			updateLayer({
				projectId,
				data: { id: layerId, name: editingLayerName.trim() || 'Без имени' },
				canvasDataURL: activeLayer ? activeLayer.canvasDataURL : '',
			}),
		);

		if (activeLayer) {
			dispatch(
				addToHistory({
					projectId,
					activeLayer,
					type: HISTORY_ACTIONS.LAYER_RENAME,
					canvasDataURL: activeLayer.canvasDataURL,
				}),
			);
		}

		setEditingLayerId(null);
		setEditingLayerName('');
	};

	const cancelEditing = () => {
		setEditingLayerId(null);
		setEditingLayerName('');
	};

	// Тут меняем порядок слоёв и добавляем это событие в историю
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = sortedLayers.findIndex(l => l.id === active.id);
		const newIndex = sortedLayers.findIndex(l => l.id === over.id);
		const newLayers = arrayMove(sortedLayers, oldIndex, newIndex);

		newLayers.forEach((layer, index) => {
			dispatch(
				updateLayer({
					projectId,
					data: {
						id: layer.id,
						zIndex: newLayers.length - index,
					},
					canvasDataURL: activeLayer ? activeLayer.canvasDataURL : '',
				}),
			);
		});

		if (activeLayer) {
			dispatch(
				addToHistory({
					projectId,
					activeLayer,
					type: HISTORY_ACTIONS.LAYER_ORDER,
					canvasDataURL: activeLayer.canvasDataURL,
				}),
			);
		}
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!activeLayer || !projectId) return;

			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

			const currentIndex = sortedLayers.findIndex(l => l.id === activeLayer.id);
			if (currentIndex === -1) return;

			if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
				if (e.key === 'ArrowUp' && currentIndex > 0) {
					e.preventDefault();
					dispatch(setActiveLayer({ projectId, id: sortedLayers[currentIndex - 1].id }));
					return;
				}

				if (e.key === 'ArrowDown' && currentIndex < sortedLayers.length - 1) {
					e.preventDefault();
					dispatch(setActiveLayer({ projectId, id: sortedLayers[currentIndex + 1].id }));
					return;
				}
			}

			if (e.ctrlKey && !e.shiftKey && !e.altKey) {
				let newIndex;
				if (e.key === 'ArrowUp') {
					newIndex = Math.max(0, currentIndex - 1);
				} else if (e.key === 'ArrowDown') {
					newIndex = Math.min(sortedLayers.length - 1, currentIndex + 1);
				} else {
					return;
				}

				e.preventDefault();
				if (currentIndex === newIndex) return;

				const newLayers = arrayMove(sortedLayers, currentIndex, newIndex);
				newLayers.forEach((layer, index) => {
					dispatch(
						updateLayer({
							projectId,
							data: { id: layer.id, zIndex: newLayers.length - index },
						}),
					);
				});
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [activeLayer, sortedLayers, projectId, dispatch]);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '36px' }}>
				<Typography variant='subtitle2'>Слои</Typography>
				<Button
					variant='tools'
					sx={{ padding: '10px' }}
					onClick={() => {
						if (!projectId) return;
						dispatch(
							createLayer({
								projectId: projectId,
								data: {
									hidden: false,
									name: 'Новый слой',
									opacity: 100,
									zIndex: layers[projectId].length + 1,
									canvasDataURL: '',
								},
								activeLayer: activeLayer,
							}),
						);
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

				{layers[projectId].length > 1 && currentLayer && (
					<MenuItem
						onClick={() => {
							handleDelete(currentLayer.id);
							handleCloseMenu();
						}}>
						Удалить
					</MenuItem>
				)}
			</Menu>
		</Box>
	);
};
