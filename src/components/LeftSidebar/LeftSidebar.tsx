import { Box, Button } from '@mui/material';
import { BrushIcon, CircleIcon, EraserIcon, MinusIcon, NavigationIcon, SquareIcon, TypeIcon } from 'lucide-react';
import React from 'react';

const TOOLS = [
	{ id: 'navigate', icon: <NavigationIcon size={16} color={'var(--color)'} />, label: 'Выделение' },
	{ id: 'brush', icon: <BrushIcon size={16} color={'var(--color)'} />, label: 'Кисть' },
	{ id: 'eraser', icon: <EraserIcon size={16} color={'var(--color)'} />, label: 'Ластик' },
	{ id: 'text', icon: <TypeIcon size={16} color={'var(--color)'} />, label: 'Текст' },
	{ id: 'rectangle', icon: <SquareIcon size={16} color={'var(--color)'} />, label: 'Прямоугольник' },
	{ id: 'circle', icon: <CircleIcon size={16} color={'var(--color)'} />, label: 'Круг' },
	{ id: 'line', icon: <MinusIcon size={16} color={'var(--color)'} />, label: 'Линия' },
];

export const LeftSidebar: React.FC = () => {
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
				<Button key={tool.id} variant='graphic-tools' title={tool.label}>
					{tool.icon}
				</Button>
			))}
		</Box>
	);
};
