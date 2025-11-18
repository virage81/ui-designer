import { MainHeader } from '@components/MainHeader';
import { ProjectsList } from '@components/ProjectsList';
import { Box } from '@mui/material';

export const MainPage: React.FC = () => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100vh',
			}}>
			<MainHeader />
			<Box
				component='main'
				sx={{
					flexGrow: 1,
				}}>
				<ProjectsList />
			</Box>
		</Box>
	);
};
