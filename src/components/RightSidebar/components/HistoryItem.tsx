import { handleHistoryAction } from '@components/Canvas/utils/historyActions';
import { Paper, Typography } from '@mui/material';
import type { History } from '@shared/types/project';
import { setHistory } from '@store/slices/projectsSlice';
import { HISTORY_NAMES } from '@store/slices/projectsSlice.const';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

interface HistoryItemProps extends Pick<History, 'id' | 'date' | 'type'> {
	layerId: string;
	pointer: number;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ id, date, type, layerId, pointer }) => {
	const dispatch = useDispatch();
	const { id: projectId = '' } = useParams();

	return (
		<Paper
			key={id}
			elevation={0}
			sx={{
				p: 1,
				mb: 0.5,
				borderRadius: 1,
				bgcolor: 'var(--header-border-color)',
				opacity: id <= pointer ? 1 : 0.5,
				color: 'var(--color)',
				cursor: 'pointer',
				transition: 'all 0.2s ease',
				'&:hover': {
					bgcolor: 'var(--hover-bg)',
				},
			}}
			onClick={() => {
				dispatch(
					setHistory({
						projectId: projectId,
						id,
					}),
				);

				const isUndo = id <= pointer;
				handleHistoryAction(dispatch, type, layerId, pointer, isUndo);
			}}>
			<Typography variant='body2' sx={{ color: 'var(--color)' }}>
				{HISTORY_NAMES[type]}
			</Typography>
			<Typography variant='caption' sx={{ color: 'var(--color)', mt: 0.5, display: 'block' }}>
				{new Date(date).toLocaleString('ru-RU')}
			</Typography>
		</Paper>
	);
};
