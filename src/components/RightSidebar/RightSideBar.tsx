import { Box, Button, IconButton, Menu, MenuItem, Paper, Slider, Tab, Tabs, Typography } from '@mui/material';
import type { Layer } from '@shared/types/project';
import type { RootState } from '@store/index';
import {
	createLayer,
	deleteLayer,
	setActiveLayer,
	sortedLayersSelector,
	updateLayer,
} from '@store/slices/projectsSlice';
import { Ellipsis, EyeIcon, EyeOffIcon, PlusIcon } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const MOCK_HISTORY = [
	{ id: 1, action: 'Добавлен слой', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 2, action: 'Создание проекта', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 3, action: 'Добавлен слой', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 4, action: 'Создание проекта', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 5, action: 'Добавлен слой', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 6, action: 'Создание проекта', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 7, action: 'Добавлен слой', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 8, action: 'Создание проекта', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 9, action: 'Добавлен слой', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 10, action: 'Создание проекта', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 11, action: 'Добавлен слой', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 12, action: 'Создание проекта', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 13, action: 'Добавлен слой', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 14, action: 'Создание проекта', timestamp: new Date('2025-11-20T21:00:11') },
	{ id: 15, action: 'Добавлен слой', timestamp: new Date('2025-11-20T21:00:11') },
];

// TODO: Implement right handleCreate
// TODO: Implement layer rename
// TODO: Implement layer order
export const RightSideBar: React.FC = () => {
	const dispatch = useDispatch();
	const { id: projectId = '' } = useParams();

	const { layers, activeLayer } = useSelector((state: RootState) => state.projects);
	const sortedLayers = useSelector((state: RootState) => sortedLayersSelector(state, projectId));

	const [activeTab, setActiveTab] = useState(0);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [currentLayerId, setCurrentLayerId] = useState<string | null>(null);
	const currentLayer = sortedLayers.find(l => l.id === currentLayerId) ?? null;
	const isMenuOpen = Boolean(anchorEl);

	const handleChange = (_: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	const handleUpdateLayer = (name: keyof Layer, value: unknown, layerId: string) => {
		if (!projectId) return;

		dispatch(updateLayer({ projectId: projectId, data: { id: layerId, [name]: value } }));
	};

	const handleDelete = (layerId: Layer['id']) => {
		dispatch(deleteLayer({ id: layerId, projectId: projectId }));
		if (layerId === activeLayer?.id) {
			dispatch(setActiveLayer({ projectId, id: layers[projectId][0].id }));
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
									dispatch(
										createLayer({
											projectId: projectId,
											data: { hidden: false, name: 'asd', opacity: 100, zIndex: layers[projectId].length + 1 },
										}),
									);
								}}>
								<PlusIcon size={16} color='var(--color)' />
							</Button>
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
							{sortedLayers.map(layer => (
								<Paper
									key={layer.id}
									elevation={0}
									onClick={() => dispatch(setActiveLayer({ projectId: projectId, id: layer.id }))}
									sx={{
										maxHeight: 'auto',
										p: 1.5,
										mb: 0.5,
										borderRadius: 1,
										bgcolor: 'var(--header-border-color)',
										color: 'var(--color)',
										border: '1px solid var(--header-border-color)',
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': {
											bgcolor: 'var(--hover-bg)',
										},
										...(layer.id === activeLayer?.id
											? {
													border: '1px solid var(--active-color-primary)',
													bgcolor: 'var(--active-bg-primary)',
											  }
											: {}),
										'&:active': {
											border: '1px solid var(--active-color-primary)',
											bgcolor: 'var(--active-bg-primary)',
										},
									}}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
										<IconButton
											sx={{ p: 0.5, color: 'var(--color)' }}
											onClick={() => handleUpdateLayer('hidden', !layer.hidden, layer.id)}>
											{!layer.hidden ? (
												<EyeIcon size={16} color='var(--color)' />
											) : (
												<EyeOffIcon size={16} color='var(--color)' />
											)}
										</IconButton>
										<Typography variant='body2' sx={{ flex: 1 }}>
											{layer.name}
										</Typography>

										<IconButton aria-label='more' onClick={e => handleOpenMenu(e, layer.id)} size='small'>
											<Ellipsis size={16} />
										</IconButton>
									</Box>

									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Typography variant='caption' sx={{ color: 'var(--color-muted)', lineHeight: 1 }}>
											Прозрачность:
										</Typography>
										<Slider
											onChange={(_, value) => handleUpdateLayer('opacity', value, layer.id)}
											value={layer.opacity}
											max={100}
											min={0}
											step={1}
											size='small'
											sx={{ flex: 1, p: 0.5 }}
										/>
										<Typography
											variant='caption'
											sx={{ color: 'var(--color-muted)', ml: 1, textAlign: 'right', lineHeight: 1 }}>
											{layer.opacity}%
										</Typography>
									</Box>
								</Paper>
							))}
						</Box>
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
								console.log('Переименовать', currentLayer.id);
							}
							handleCloseMenu();
						}}>
						Переименовать
					</MenuItem>

					<MenuItem
						onClick={() => {
							if (currentLayer) {
								console.log('Очистить', currentLayer.id);
							}
							handleCloseMenu();
						}}>
						Очистить
					</MenuItem>

					{currentLayer && !currentLayer.isBase && (
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
							{MOCK_HISTORY.map(item => (
								<Paper
									key={item.id}
									elevation={0}
									sx={{
										p: 1,
										mb: 0.5,
										borderRadius: 1,
										bgcolor: 'var(--header-border-color)',
										color: 'var(--color)',
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': {
											bgcolor: 'var(--hover-bg)',
										},
									}}>
									<Typography variant='body2' sx={{ color: 'var(--color)' }}>
										{item.action}
									</Typography>
									<Typography variant='caption' sx={{ color: 'var(--color)', mt: 0.5, display: 'block' }}>
										{item.timestamp.toLocaleTimeString('ru-RU')}
									</Typography>
								</Paper>
							))}
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	);
};
