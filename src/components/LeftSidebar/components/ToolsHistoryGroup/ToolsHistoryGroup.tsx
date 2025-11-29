import { Box, Button } from '@mui/material';
import { ACTIONS } from '@store/slices/toolsSlice';
import { Redo2Icon, Undo2Icon } from 'lucide-react';

const HISTORY_TOOLS = [
	{ id: ACTIONS.UNDO, icon: <Undo2Icon size={16} color={'var(--color)'} />, label: 'Назад', isDisabled: false },
	{
		id: ACTIONS.REDO,
		icon: <Redo2Icon size={16} color={'var(--color-muted)'} />,
		label: 'Вперед',
		isDisabled: true,
	},
];

export const ToolsHistoryGroup: React.FC = () => {
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
