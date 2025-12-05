import { Box, Typography } from '@mui/material';
import type { RootState } from '@store/index';
import { historySelector, pointerSelector } from '@store/slices/projectsSlice';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { HistoryItem } from './HistoryItem';

export const HistoryTab = () => {
	const { id: projectId = '' } = useParams();

	const history = useSelector((state: RootState) => historySelector(state, projectId));
	const pointer = useSelector((state: RootState) => pointerSelector(state, projectId));

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
				{history.map((_, idx) => {
					const reversedIndex = history.length - 1 - idx;
					const el = history[reversedIndex];

					return el && el.id !== '' ? (
						<HistoryItem key={el.id} {...el} index={reversedIndex} isActive={pointer >= reversedIndex} />
					) : null;
				})}
			</Box>
		</Box>
	);
};
