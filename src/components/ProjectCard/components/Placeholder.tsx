import { ImageOutlined } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

export const Placeholder = () => {
	return (
		<Box
			sx={{
				aspectRatio: 16/9,
				background: `linear-gradient(145deg,
						var(--card-placeholder-bg-t) 0%,
						var(--card-placeholder-bg-b) 100%)`,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				borderTopLeftRadius: 8,
				borderTopRightRadius: 8,
				color: 'text.secondary',
			}}>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: 64,
					height: 64,
					backgroundColor: 'var(--card-placeholder-square)',
					borderRadius: 2,
					mb: 1,
				}}>
				<ImageOutlined
					sx={{
						fontSize: 32,
						color: 'var(--card-placeholder-icon)',
					}}
				/>
			</Box>
			<Typography variant='body2' sx={{ fontSize: '0.85rem', color: 'var(--color-dark)' }}>
				Нет превью
			</Typography>
		</Box>
	);
};
