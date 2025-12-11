import { Paper, Typography } from '@mui/material';
import type { History } from '@shared/types/project';
import { clearLayerCanvas, clearObjects, restoreLayerObjects, restoreObjects } from '@store/slices/canvasSlice';
import { setHistory } from '@store/slices/projectsSlice';
import { HISTORY_NAMES } from '@store/slices/projectsSlice.const';
import { HISTORY_ACTIONS } from '@store/slices/projectsSlice.enums';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

interface HistoryItemProps extends Pick<History, 'id' | 'date' | 'type'> {
	isActive: boolean;
	layerId: string;
	pointer: number;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ id, date, type, isActive, layerId, pointer }) => {
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
			onClick={() => {
				dispatch(
					setHistory({
						projectId: projectId,
						id,
					}),
				);
				// Тут возвращаем объекты очищенного слоя
				if (type === HISTORY_ACTIONS.LAYER_CLEAR && isActive) {
					dispatch(restoreLayerObjects(layerId));
				}

				// Либо очищаем
				if (type === HISTORY_ACTIONS.LAYER_CLEAR && !isActive) {
					dispatch(clearLayerCanvas(layerId));
				}

				// Возврат одиночных объектов
				if (
					(type === HISTORY_ACTIONS.RECTANGLE ||
						type === HISTORY_ACTIONS.BRUSH ||
						type === HISTORY_ACTIONS.CIRCLE ||
						type === HISTORY_ACTIONS.TEXT ||
						type === HISTORY_ACTIONS.LINE) &&
					!isActive
				) {
					dispatch(restoreObjects({ layerId, start: pointer + 1, end: id }));
				}

				// Очистка одиночных объектов
				if (
					(type === HISTORY_ACTIONS.RECTANGLE ||
						type === HISTORY_ACTIONS.BRUSH ||
						type === HISTORY_ACTIONS.CIRCLE ||
						type === HISTORY_ACTIONS.TEXT ||
						type === HISTORY_ACTIONS.LINE) &&
					isActive
				) {
					dispatch(clearObjects({ layerId, start: id, end: pointer }));
				}
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
