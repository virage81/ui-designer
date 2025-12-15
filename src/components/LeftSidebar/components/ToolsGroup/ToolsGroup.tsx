import { Box, Button } from '@mui/material';
import type { RootState } from '@store/index';
import { ACTIONS, setTool } from '@store/slices/toolsSlice';
import { BrushIcon, CircleIcon, EraserIcon, MinusIcon, NavigationIcon, SquareIcon } from 'lucide-react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const TOOLS = [
	{ id: ACTIONS.SELECT, icon: <NavigationIcon size={16} color={'var(--color)'} />, label: 'Выделение' },
	{ id: ACTIONS.BRUSH, icon: <BrushIcon size={16} color={'var(--color)'} />, label: 'Кисть' },
	{ id: ACTIONS.ERASER, icon: <EraserIcon size={16} color={'var(--color)'} />, label: 'Ластик' },
	// { id: ACTIONS.TEXT, icon: <TypeIcon size={16} color={'var(--color)'} />, label: 'Текст' },
	{ id: ACTIONS.RECTANGLE, icon: <SquareIcon size={16} color={'var(--color)'} />, label: 'Прямоугольник' },
	{ id: ACTIONS.CIRCLE, icon: <CircleIcon size={16} color={'var(--color)'} />, label: 'Круг' },
	{ id: ACTIONS.LINE, icon: <MinusIcon size={16} color={'var(--color)'} />, label: 'Линия' },
];

export const ToolsGroup: React.FC = () => {
	const { tool } = useSelector((state: RootState) => state.tools);

	const dispatch = useDispatch();

	const isToolActive = useCallback((toolId: ACTIONS) => tool === toolId, [tool]);

	const handleToolClick = useCallback(
		(toolId: ACTIONS) => {
			dispatch(setTool(toolId));
		},
		[dispatch],
	);

	return (
		<Box>
			{TOOLS.map(tool => (
				<Button
					key={tool.id}
					variant='graphic-tools'
					title={tool.label}
					onClick={() => handleToolClick(tool.id)}
					sx={{
						backgroundColor: isToolActive(tool.id) ? 'var(--color-primary)' : 'transparent',
						'&:hover': {
							backgroundColor: isToolActive(tool.id) ? 'var(--color-primary)' : 'var(--hover-bg)',
						},
					}}>
					{tool.icon}
				</Button>
			))}
		</Box>
	);
};
