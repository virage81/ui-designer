import { Paper, Typography } from '@mui/material';
import { redo, undo } from '@store/slices/projectsSlice';
import { HISTORY_ACTIONS } from '@store/slices/projectsSlice.enums';
import type { ACTIONS } from '@store/slices/toolsSlice';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

interface HistoryItemProps {
	id: number;
	date: string;
	type: HISTORY_ACTIONS | ACTIONS;
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
				isActive
					? dispatch(
							undo({
								projectId: projectId,
								pointer: id,
							}),
					  )
					: dispatch(
							redo({
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
