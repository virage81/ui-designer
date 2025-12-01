import { Box, Paper, Typography } from '@mui/material';

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

export const HistoryTab = () => {
	return (
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
	);
};
