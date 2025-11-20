import { Box, Container, Grid, Typography } from '@mui/material';
import { EmptyProjectsState } from '@components/EmptyProjectsState';
import { ProjectCard } from '@components/ProjectCard';

const projects = [
	{
		id: 1,
		title: 'Мой первый проект',
		updatedAt: '16 нояб. 2025 г.',
		previewUrl: 'https://wallpaper.forfun.com/fetch/11/11a73adf58ad1cbb6ee08f4971a0027a.jpeg',
	},
	{ id: 2, title: 'Проект 2', updatedAt: '17 нояб. 2025 г.', previewUrl: '' },
	{
		id: 3,
		title: 'Проект 3',
		updatedAt: '18 нояб. 2025 г.',
		previewUrl: 'https://wallpaper.forfun.com/fetch/11/11a73adf58ad1cbb6ee08f4971a0027a.jpeg',
	},
	{ id: 4, title: 'Проект 4', updatedAt: '19 нояб. 2025 г.', previewUrl: '' },
	{ id: 5, title: 'Проект 5', updatedAt: '20 нояб. 2025 г.', previewUrl: '' },
	{ id: 6, title: 'Проект 6', updatedAt: '20 нояб. 2025 г.', previewUrl: '' },
	{
		id: 7,
		title: 'Проект 7',
		updatedAt: '21 нояб. 2025 г.',
		previewUrl: 'https://wallpaper.forfun.com/fetch/11/11a73adf58ad1cbb6ee08f4971a0027a.jpeg',
	},
	{ id: 8, title: 'Проект 8', updatedAt: '21 нояб. 2025 г.', previewUrl: '' },
]; //TODO удалить (для теста)
// const projects = []; //TODO удалить (для теста)

interface ProjectsListProps {
	handleOpenDeleteConfirmModal: (title: string) => void;
} //TODO удалить, когда появится StateManager

export const ProjectsList: React.FC<ProjectsListProps> = ({ handleOpenDeleteConfirmModal }) => {
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
					<Grid container spacing={3} justifyContent='center' sx={{ mt: 3 }}>
						{projects.map(project => (
							<Grid key={project.id}>
								<ProjectCard {...project} openModal={handleOpenDeleteConfirmModal} />
							</Grid>
						))}
					</Grid>
				)}
			</Container>
		</Box>
	);
};
