import { Box, Button, Typography } from '@mui/material';
import type { RootState } from '@store/index';
import { clearHistory, historySelector, isHistorySlicedSelector, pointerSelector } from '@store/slices/projectsSlice';
import { Trash2Icon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { HistoryItem } from './HistoryItem';

export const HistoryTab = () => {
	const dispatch = useDispatch();
	const { id: projectId = '' } = useParams();

	const { activeLayer } = useSelector((state: RootState) => state.projects);
	const history = useSelector((state: RootState) => historySelector(state, projectId));
	const pointer = useSelector((state: RootState) => pointerSelector(state, projectId));
	const isHistorySliced = useSelector((state: RootState) => isHistorySlicedSelector(state, projectId));

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '36px' }}>
				<Typography variant='subtitle2'>История действий</Typography>
				<Button
					variant='tools'
					title='Очистить историю'
					sx={{ padding: '10px' }}
					onClick={() => {
						if (!projectId) return;
						dispatch(clearHistory({ projectId }));
					}}>
					<Trash2Icon size={16} color='var(--color)' />
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
				{history &&
					activeLayer?.id &&
					history.map((_, idx) => {
						const reversedIndex = history.length - 1 - idx;
						const el = history[reversedIndex];

						return el && pointer !== undefined && (el.id !== 0 || !isHistorySliced) ? (
							<HistoryItem key={el.id} {...el} isActive={pointer >= reversedIndex} />
						) : null;
					})}
			</Box>
		</Box>
	);
};
