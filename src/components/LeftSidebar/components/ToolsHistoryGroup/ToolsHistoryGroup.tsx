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
		icon: <Undo2Icon size={16} color={'var(--color)'} />,
		label: 'Отменить (Ctrl+Z)',
		isDisabled: false,
	},
	{
		id: ACTIONS.REDO,
		icon: <Redo2Icon size={16} color={'var(--color-muted)'} />,
		label: 'Вернуть (Ctrl+Shift+Z)',
		isDisabled: true,
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
				console.log('UNDO triggered');
				// dispatch(undoAction()); TODO
			}

			if (e.ctrlKey && e.shiftKey && !e.altKey && e.code === 'KeyZ') {
				e.preventDefault();
				console.log('REDO triggered');
				// dispatch(redoAction()); TODO
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

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
