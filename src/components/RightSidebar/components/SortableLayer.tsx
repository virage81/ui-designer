import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, IconButton, Paper, Slider, TextField, Typography } from '@mui/material';
import type { Layer } from '@shared/types/project';
import { setActiveLayer } from '@store/slices/projectsSlice';
import { Ellipsis, EyeIcon, EyeOffIcon, GripVertical } from 'lucide-react';
import { type MouseEvent } from 'react';
import { useDispatch } from 'react-redux';

interface SortableLayerProps {
	layer: Layer;
	projectId: string;
	isActive: boolean;
	editingLayerId: string | null;
	editingLayerName: string;
	startEditing: (id: string, name: string) => void;
	saveLayerName: (id: string) => void;
	cancelEditing: () => void;
	handleUpdateLayer: (name: keyof Layer, value: unknown, layerId: string) => void;
	handleOpenMenu: (e: MouseEvent<HTMLButtonElement>, layerId?: string) => void;
}

export const SortableLayer: React.FC<SortableLayerProps> = ({
	layer,
	projectId,
	isActive,
	editingLayerId,
	editingLayerName,
	startEditing,
	saveLayerName,
	cancelEditing,
	handleUpdateLayer,
	handleOpenMenu,
}) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: layer.id });
	const dispatch = useDispatch();

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const handleLayerClick = () => {
		if (!editingLayerId) {
			dispatch(setActiveLayer({ projectId, id: layer.id }));
		}
	};

	return (
		<Paper
			ref={setNodeRef}
			style={style}
			elevation={0}
			onClick={handleLayerClick}
			sx={{
				p: 1.5,
				mb: 0.5,
				borderRadius: 1,
				bgcolor: 'var(--header-border-color)',
				color: 'var(--color)',
				border: isActive ? '1px solid var(--active-color-primary)' : '1px solid var(--header-border-color)',
				cursor: 'pointer',
				transition: 'all 0.2s ease',
				'&:hover': {
					bgcolor: 'var(--hover-bg)',
				},
			}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
				{!layer.isBase && (
					<IconButton
						sx={{
							p: 0.5,
							cursor: 'grab',
							'&:active': { cursor: 'grabbing' },
							color: 'var(--color)',
						}}
						{...attributes}
						{...listeners}
						onClick={e => e.stopPropagation()}>
						<GripVertical size={16} />
					</IconButton>
				)}

				<IconButton
					sx={{ p: 0.5, color: 'var(--color)' }}
					onClick={e => {
						e.stopPropagation();
						handleUpdateLayer('hidden', !layer.hidden, layer.id);
					}}>
					{!layer.hidden ? <EyeIcon size={16} color='var(--color)' /> : <EyeOffIcon size={16} color='var(--color)' />}
				</IconButton>

				{editingLayerId === layer.id ? (
					<TextField
						variant='standard'
						size='small'
						value={editingLayerName}
						onChange={e => startEditing(layer.id, e.target.value)}
						onBlur={() => saveLayerName(layer.id)}
						onKeyDown={e => {
							if (e.key === 'Enter') saveLayerName(layer.id);
							if (e.key === 'Escape') cancelEditing();
						}}
						autoFocus
						sx={{ flex: 1 }}
						onClick={e => e.stopPropagation()}
					/>
				) : (
					<Typography
						variant='body2'
						sx={{
							flex: 1,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							minWidth: 0,
						}}
						onDoubleClick={e => {
							e.stopPropagation();
							startEditing(layer.id, layer.name);
						}}>
						{layer.name}
					</Typography>
				)}

				<IconButton
					aria-label='more'
					size='small'
					onClick={e => {
						e.stopPropagation();
						handleOpenMenu(e, layer.id);
					}}
					sx={{ color: 'var(--color)' }}>
					<Ellipsis size={16} />
				</IconButton>
			</Box>

			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={e => e.stopPropagation()}>
				<Typography variant='caption' sx={{ color: 'var(--color-muted)', lineHeight: 1 }}>
					Прозрачность:
				</Typography>
				<Slider
					onChange={(_, value) => handleUpdateLayer('opacity', value, layer.id)}
					value={layer.opacity}
					max={100}
					min={0}
					step={1}
					size='small'
					sx={{ flex: 1, p: 0.5 }}
				/>
				<Typography variant='caption' sx={{ color: 'var(--color-muted)', ml: 1, textAlign: 'right', lineHeight: 1 }}>
					{layer.opacity}%
				</Typography>
			</Box>
		</Paper>
	);
};
