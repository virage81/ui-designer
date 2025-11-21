import { Box, Button, IconButton, Paper, Slider, Tab, Tabs, Typography } from '@mui/material';
import { EyeIcon, EyeOffIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import React, { useState } from 'react';

// Статические данные для отображения
const MOCK_LAYERS = [
	{ id: 1, name: 'Слой 1', visible: false, opacity: 100 },
	{ id: 2, name: 'ФОН', visible: true, opacity: 100 },
	{ id: 3, name: 'Слой 1', visible: true, opacity: 100 },
	{ id: 4, name: 'ФОН', visible: true, opacity: 100 },
	{ id: 5, name: 'Слой 1', visible: true, opacity: 100 },
	{ id: 6, name: 'ФОН', visible: true, opacity: 100 },
	{ id: 7, name: 'Слой 1', visible: true, opacity: 100 },
	{ id: 8, name: 'ФОН', visible: true, opacity: 100 },
	{ id: 9, name: 'Слой 1', visible: true, opacity: 100 },
	{ id: 10, name: 'ФОН', visible: true, opacity: 100 },
	{ id: 11, name: 'Слой 1', visible: true, opacity: 100 },
	{ id: 12, name: 'ФОН', visible: true, opacity: 100 },
	{ id: 13, name: 'Слой 1', visible: true, opacity: 100 },
	{ id: 14, name: 'ФОН', visible: true, opacity: 100 },
	{ id: 15, name: 'Слой 1', visible: true, opacity: 100 },
];

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

export const RightSideBar: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
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
							<Button variant='tools' sx={{ padding: '10px' }}>
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
							{MOCK_LAYERS.map(layer => (
								<Paper
									key={layer.id}
									elevation={0}
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
										'&:active': {
											border: '1px solid var(--active-color-primary)',
											bgcolor: 'var(--active-bg-primary)',
										},
									}}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
										<IconButton sx={{ p: 0.5, color: 'var(--color)' }}>
											{layer.visible ? (
												<EyeIcon size={16} color='var(--color)' />
											) : (
												<EyeOffIcon size={16} color='var(--color)' />
											)}
										</IconButton>
										<Typography variant='body2' sx={{ flex: 1 }}>
											{layer.name}
										</Typography>
										<IconButton size='small' sx={{ p: 0.5, color: 'var(--color-muted)', '&:hover': { color: 'red' } }}>
											<Trash2Icon size={16} />
										</IconButton>
									</Box>

									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Typography variant='caption' sx={{ color: 'var(--color-muted)', lineHeight: 1 }}>
											Прозрачность:
										</Typography>
										<Slider value={layer.opacity} max={100} min={0} step={1} size='small' sx={{ flex: 1, p: 0.5 }} />
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
