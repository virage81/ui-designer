import { handleHistoryAction } from '@components/Canvas/utils/historyActions';
import { Box, Button } from '@mui/material';
import type { RootState } from '@store/index';
import {
	historyElTypeSelector,
	isRedoActiveSelector,
	isUndoActiveSelector,
	nextHistoryElTypeSelector,
	pointerSelector,
	redoHistory,
	undoHistory,
} from '@store/slices/projectsSlice';
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
							dispatch(undoHistory({ projectId }));
							if (historyType && activeLayer?.id) {
								handleHistoryAction(dispatch, historyType, activeLayer.id, pointer, true);
							}
						}

						if (tool.id === ACTIONS.REDO) {
							dispatch(redoHistory({ projectId }));
							if (nextHistoryType && activeLayer?.id) {
								handleHistoryAction(dispatch, nextHistoryType, activeLayer.id, pointer, false);
							}
						}
					}}
				/>
			))}
		</Box>
	);
};
