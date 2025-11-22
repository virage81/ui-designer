import { Box } from '@mui/material';

export const Canvas: React.FC = () => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				flexGrow: 1,
				gap: '0.5rem',
				width: '63px',
				padding: '8px 8px',
				backgroundColor: 'var(--main-bg)',
			}}>
			<Box sx={{ width: '800px', height: '600px', boxShadow: 3, overflow: 'hidden', backgroundColor: 'white' }}>
				<canvas id='canvas' style={{ width: '100%', height: '100%' }}></canvas>
			</Box>
		</Box>
	);
};
