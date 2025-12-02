import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useProject } from '@shared/hooks/useProject';
import { House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopMenu: React.FC = () => {
	const currentProject = useProject();

	const navigate = useNavigate();

	return (
		<div>
			<AppBar position='static'>
				<Toolbar variant='dense'>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexGrow: 1 }}>
						<Button variant='graphic-tools' disableElevation onClick={() => navigate('/')}>
							<House />
						</Button>
						<Button variant='tools' disableElevation>
							Файл
						</Button>
					</Box>
					<Box>
						<Typography noWrap sx={{ color: 'var(--color-muted)' }}>
							{currentProject?.name}
						</Typography>
					</Box>
				</Toolbar>
			</AppBar>
		</div>
	);
};
