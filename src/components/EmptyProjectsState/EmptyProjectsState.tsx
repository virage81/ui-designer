import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';

export const EmptyProjectsState: React.FC = () => {
	return (
		<Box
			sx={{
				textAlign: 'center',
				mt: 10,
			}}>
			<Typography variant='body2' sx={{ mt: 2, color: 'var(--color-dark)', fontSize: '1rem' }}>
				У вас пока нет проектов
			</Typography>
			<Button
				variant='contained'
				startIcon={<Add />}
				sx={{
					textTransform: 'none',
					mt: 2,
				}}>
				Создать первый проект
			</Button>
		</Box>
	);
};
