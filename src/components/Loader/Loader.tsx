import { Box, CircularProgress, Stack } from '@mui/material';

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
			<Stack direction='column' spacing={1} alignItems='center'>
				<CircularProgress size={50} />
			</Stack>
		</Box>
	);
};
