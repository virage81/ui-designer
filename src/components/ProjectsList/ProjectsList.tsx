import { Box, Container, Typography } from '@mui/material';
import { EmptyProjectsState } from '@components/EmptyProjectsState';
import { ProjectCard } from '@components/ProjectCard';

const projectsTest = [ //TODO удалить (для теста)
	{ id: 1, title: 'Мой первый проект', date: '16 нояб. 2025 г.' },
	{ id: 2, title: 'Проект 2', date: '16 нояб. 2025 г.' },
	{ id: 3, title: 'Проект 3', date: '16 нояб. 2025 г.' },
	{ id: 4, title: 'Проект 4', date: '16 нояб. 2025 г.' },
];
// const projectsTest = []; //TODO удалить (для теста)

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
				<Typography
					variant='body2'
					sx={{
						mt: 1,
						color: 'var(--color-dark)',
						fontSize: '1rem',
					}}>
					Выберите проект для редактирования или создайте новый
				</Typography>
				{!projectsTest.length ? <EmptyProjectsState /> : <ProjectCard />}
			</Container>
		</Box>
	);
};
