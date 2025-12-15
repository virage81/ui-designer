import { Box, Button } from '@mui/material';
import { ACTIONS } from '@store/slices/toolsSlice';
import { Redo2Icon, Undo2Icon } from 'lucide-react';
import { useEffect } from 'react';

const HISTORY_TOOLS = [
	{
		id: ACTIONS.UNDO,
		icon: <Undo2Icon size={16} color={'var(--color)'} />,
		label: 'Назад (Ctrl+Z)',
		isDisabled: false,
	},
	{
		id: ACTIONS.REDO,
		icon: <Redo2Icon size={16} color={'var(--color-muted)'} />,
		label: 'Вперед (Ctrl+Shift+Z)',
		isDisabled: true,
	},
];

export const ToolsHistoryGroup: React.FC = () => {
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
					disabled={tool.isDisabled}
					onClick={e => {
						console.log('click:', e);
					}}>
					{tool.icon}
				</Button>
			))}
		</Box>
	);
};
