import { Box, CircularProgress } from '@mui/material';

export const Loader: React.FC = () => {
	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				maxWidth: '100%',
				bgcolor: 'var(--main-bg)',
			}}>
			<CircularProgress size={50} />
		</Box>
	);
};
