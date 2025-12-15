import { Box, Button, IconButton, Paper, Slider, Typography } from '@mui/material';
import type { RootState } from '@store/index';
import { setZoom } from '@store/slices/projectsSlice';
import { RefreshCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

export const ZoomBar = () => {
	const dispatch = useDispatch();

	const zoom = useSelector((state: RootState) => state.projects.zoom);

	const percent = Math.round(zoom * 100);

	const handleSlider = (value: number) => dispatch(setZoom(value));
	const handleMinus = () => dispatch(setZoom(Math.max(0.1, zoom - 0.1)));
	const handlePlus = () => dispatch(setZoom(Math.min(3, zoom + 0.1)));
	const handleReset = () => dispatch(setZoom(1));

	return (
		<Paper
			elevation={5}
			sx={{
				position: 'sticky',
				bottom: 0,
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				justifyContent: 'center',
				p: 0.5,
				borderRadius: 0,
				borderTop: '1px solid var(--header-border-color)',
				background: 'var(--header-bg)',
			}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
				<Typography variant='body2' sx={{ color: 'var(--color)', minWidth: 40, textAlign: 'right' }}>
					{percent}%
				</Typography>
				<Button
					variant='outlined'
					size='small'
					onClick={handleReset}
					startIcon={<RefreshCcw size={14} />}
					sx={{
						borderColor: 'var(--header-modal-border-color)',
						color: 'var(--color-dark)',
						p: '2px 10px',
						'&:hover': { color: 'var(--color)' },
					}}>
					Сброс
				</Button>
			</Box>

			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '35%' }}>
				<IconButton onClick={handleMinus} size='small' sx={{ color: 'var(--color)' }}>
					<ZoomOut size={18} />
				</IconButton>

				<Slider
					value={zoom}
					min={0.1}
					max={3}
					step={0.05}
					onChange={(_, value) => handleSlider(value)}
					sx={{
						width: '200px',
						'& .MuiSlider-thumb': { width: 14, height: 14 },
					}}
				/>

				<IconButton onClick={handlePlus} size='small' sx={{ color: 'var(--color)' }}>
					<ZoomIn size={18} />
				</IconButton>
			</Box>
		</Paper>
	);
};
