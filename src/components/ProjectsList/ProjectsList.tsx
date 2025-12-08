import { EmptyProjectsState } from '@components/EmptyProjectsState';
import { ProjectCard } from '@components/ProjectCard';
import { Box, Container, Grid, Typography } from '@mui/material';
import type { RootState } from '@store/index';
import { useSelector } from 'react-redux';

export const ProjectsList: React.FC = () => {
	const { projects } = useSelector((state: RootState) => state.projects);

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
				<Typography
					variant='body2'
					sx={{
						mt: 1,
						color: 'var(--color-dark)',
						fontSize: '1rem',
					}}>
					Выберите проект для редактирования или создайте новый
				</Typography>
				{!projects.length ? (
					<EmptyProjectsState />
				) : (
					<Grid container spacing={3} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 3 }}>
						{projects.map(project => (
							<Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
								<ProjectCard {...project} />
							</Grid>
						))}
					</Grid>
				)}
			</Container>
		</Box>
	);
};
