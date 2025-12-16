import { Box, Button } from '@mui/material';
import type { RootState } from '@store/index';
import { isRedoActiveSelector, isUndoActiveSelector, redoHistory, undoHistory } from '@store/slices/projectsSlice';
import { ACTIONS } from '@store/slices/toolsSlice';
import { Redo2Icon, Undo2Icon } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const HISTORY_TOOLS = [
	{
		id: ACTIONS.UNDO,
		label: 'Отменить (Ctrl+Z)',
	},
	{
		id: ACTIONS.REDO,
		label: 'Вернуть (Ctrl+Shift+Z)',
	},
];

export const ToolsHistoryGroup: React.FC = () => {
	const dispatch = useDispatch();
	const { id: projectId = '' } = useParams();
	const isUndoActive = useSelector((state: RootState) => isUndoActiveSelector(state, projectId));
	const isRedoActive = useSelector((state: RootState) => isRedoActiveSelector(state, projectId));

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
				return;
			}

			if (e.ctrlKey && !e.shiftKey && !e.altKey && e.code === 'KeyZ') {
				e.preventDefault();
				if (!isUndoActive) return;
	
				dispatch(
					undoHistory({
						projectId,
					}),
				);
			}

			if (e.ctrlKey && e.shiftKey && !e.altKey && e.code === 'KeyZ') {
				e.preventDefault();
				if (!isRedoActive) return;

				dispatch(
					redoHistory({
						projectId,
					}),
				);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [dispatch, projectId, isUndoActive, isRedoActive]);

	return (
		<Box>
			{HISTORY_TOOLS.map(tool => (
				<Button
					key={tool.id}
					variant='graphic-tools'
					title={tool.label}
					disabled={tool.id === ACTIONS.UNDO ? !isUndoActive : !isRedoActive}
					onClick={() =>
						dispatch(
							tool.id === ACTIONS.UNDO
								? undoHistory({
										projectId: projectId,
								  })
								: redoHistory({
										projectId: projectId,
								  }),
						)
					}>
					{tool.id === ACTIONS.UNDO ? (
						<Undo2Icon size={16} color={isUndoActive ? 'var(--color)' : 'var(--color-muted)'} />
					) : (
						<Redo2Icon size={16} color={isRedoActive ? 'var(--color)' : 'var(--color-muted)'} />
					)}
				</Button>
			))}
		</Box>
	);
};
