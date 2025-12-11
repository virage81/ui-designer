import { Box, Button } from '@mui/material';
import type { RootState } from '@store/index';
import { clearLayerCanvas, clearObjects, restoreLayerObjects, restoreObjects } from '@store/slices/canvasSlice';
import {
	historyElTypeSelector,
	isRedoActiveSelector,
	isUndoActiveSelector,
	nextHistoryElTypeSelector,
	pointerSelector,
	redoHistory,
	undoHistory,
} from '@store/slices/projectsSlice';
import { HISTORY_ACTIONS } from '@store/slices/projectsSlice.enums';
import { ACTIONS } from '@store/slices/toolsSlice';
import { Redo2Icon, Undo2Icon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const HISTORY_TOOLS = [
	{
		id: ACTIONS.UNDO,
		label: 'Отменить',
	},
	{
		id: ACTIONS.REDO,
		label: 'Вернуть',
	},
];

export const ToolsHistoryGroup: React.FC = () => {
	const dispatch = useDispatch();
	const { id: projectId = '' } = useParams();

	const { activeLayer } = useSelector((state: RootState) => state.projects);
	const isUndoActive = useSelector((state: RootState) => isUndoActiveSelector(state, projectId));
	const isRedoActive = useSelector((state: RootState) => isRedoActiveSelector(state, projectId));
	const historyType = useSelector((state: RootState) => historyElTypeSelector(state, projectId));
	const nextHistoryType = useSelector((state: RootState) => nextHistoryElTypeSelector(state, projectId));
	const pointer = useSelector((state: RootState) => pointerSelector(state, projectId));

	return (
		<Box>
			{HISTORY_TOOLS.map(tool => (
				<Button
					key={tool.id}
					variant='graphic-tools'
					title={tool.label}
					disabled={tool.id === ACTIONS.UNDO ? !isUndoActive : !isRedoActive}
					startIcon={
						tool.id === ACTIONS.UNDO ? (
							<Undo2Icon size={16} color={isUndoActive ? 'var(--color)' : 'var(--color-muted)'} />
						) : (
							<Redo2Icon size={16} color={isRedoActive ? 'var(--color)' : 'var(--color-muted)'} />
						)
					}
					onClick={() => {
						if (tool.id === ACTIONS.UNDO) {
							dispatch(
								undoHistory({
									projectId: projectId,
								}),
							);

							// Тут возвращаем объекты очищенного слоя
							if (historyType === HISTORY_ACTIONS.LAYER_CLEAR && activeLayer?.id) {
								dispatch(restoreLayerObjects(activeLayer.id));
							}

							// Очистка одиночных объектов
							if (
								(historyType === HISTORY_ACTIONS.RECTANGLE ||
									historyType === HISTORY_ACTIONS.BRUSH ||
									historyType === HISTORY_ACTIONS.CIRCLE ||
									historyType === HISTORY_ACTIONS.TEXT ||
									historyType === HISTORY_ACTIONS.LINE) &&
								activeLayer?.id
							) {
								dispatch(clearObjects({ layerId: activeLayer.id, start: pointer, end: pointer - 1 }));
							}
						}

						if (tool.id === ACTIONS.REDO) {
							dispatch(
								redoHistory({
									projectId: projectId,
								}),
							);

							// Тут очищаем объекты очищенного слоя
							if (nextHistoryType === HISTORY_ACTIONS.LAYER_CLEAR && activeLayer?.id) {
								dispatch(clearLayerCanvas(activeLayer.id));
							}

							// Возврат одиночных объектов
							if (
								(nextHistoryType === HISTORY_ACTIONS.RECTANGLE ||
									nextHistoryType === HISTORY_ACTIONS.BRUSH ||
									nextHistoryType === HISTORY_ACTIONS.CIRCLE ||
									nextHistoryType === HISTORY_ACTIONS.TEXT ||
									nextHistoryType === HISTORY_ACTIONS.LINE) &&
								activeLayer?.id
							) {
								dispatch(restoreObjects({ layerId: activeLayer.id, start: pointer + 1, end: pointer + 1 }));
							}
						}
					}}
				/>
			))}
		</Box>
	);
};
