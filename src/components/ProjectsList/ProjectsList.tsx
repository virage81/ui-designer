import { EmptyProjectsState } from '@components/EmptyProjectsState';
import { Box, Container, Typography } from '@mui/material';

const projectsTest = [];

export const ProjectsList: React.FC = () => {
	return (
		<Box
			sx={{
				height: '100%',
				p: 3,
				background: 'var(--main-bg)',
				color: 'var(--color)',
			}}>
			<Container maxWidth='lg'>
				<Typography
					component='h2'
					sx={{
						fontSize: '1.2rem',
						fontWeight: 600,
					}}>
					Мои проекты
				</Typography>
				<Typography variant='body2' sx={{ mt: 2, color: 'var(--color-dark)' }}>
					Выберите проект для редактирования или создайте новый
				</Typography>
				{!projectsTest.length ? <EmptyProjectsState /> : null}
			</Container>
		</Box>
	);
};
