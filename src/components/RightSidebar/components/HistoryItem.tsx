import { Paper, Typography } from '@mui/material';
import type { History } from '@shared/types/project';
import { setHistory } from '@store/slices/projectsSlice';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

interface HistoryItemProps extends Pick<History, 'id' | 'date' | 'type'> {
	isActive: boolean;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ id, date, type, isActive }) => {
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
				opacity: isActive ? 1 : 0.5,
				color: 'var(--color)',
				cursor: 'pointer',
				transition: 'all 0.2s ease',
				'&:hover': {
					bgcolor: 'var(--hover-bg)',
				},
			}}
			onClick={() =>
				dispatch(
					setHistory({
						projectId: projectId,
						pointer: id,
					}),
				)
			}>
			<Typography variant='body2' sx={{ color: 'var(--color)' }}>
				{type}
			</Typography>
			<Typography variant='caption' sx={{ color: 'var(--color)', mt: 0.5, display: 'block' }}>
				{date}
				{/* @TODO: убрать, это для наглядности */}
				{<br />}
				{<br />}
				id: {id}
			</Typography>
		</Paper>
	);
};
