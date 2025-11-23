import { Box, Button } from '@mui/material';
import { ACTIONS, setTool } from '@store/slices/toolsSlice';
import { BrushIcon, CircleIcon, EraserIcon, MinusIcon, NavigationIcon, SquareIcon, TypeIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';

const TOOLS = [
	{ id: ACTIONS.SELECT, icon: <NavigationIcon size={16} color={'var(--color)'} />, label: 'Выделение' },
	{ id: ACTIONS.BRUSH, icon: <BrushIcon size={16} color={'var(--color)'} />, label: 'Кисть' },
	{ id: ACTIONS.ERASER, icon: <EraserIcon size={16} color={'var(--color)'} />, label: 'Ластик' },
	{ id: ACTIONS.TEXT, icon: <TypeIcon size={16} color={'var(--color)'} />, label: 'Текст' },
	{ id: ACTIONS.RECTANGLE, icon: <SquareIcon size={16} color={'var(--color)'} />, label: 'Прямоугольник' },
	{ id: ACTIONS.CIRCLE, icon: <CircleIcon size={16} color={'var(--color)'} />, label: 'Круг' },
	{ id: ACTIONS.LINE, icon: <MinusIcon size={16} color={'var(--color)'} />, label: 'Линия' },
];

export const LeftSidebar: React.FC = () => {
	const dispatch = useDispatch();

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '0.5rem',
				width: '63px',
				padding: '8px 8px',
				borderRight: '1px solid',
				borderColor: 'var(--header-border-color)',
				backgroundColor: 'var(--header-bg)',
			}}>
			{TOOLS.map(tool => (
				<Button key={tool.id} variant='graphic-tools' title={tool.label} onClick={() => dispatch(setTool(tool.id))}>
					{tool.icon}
				</Button>
			))}
		</Box>
	);
};
