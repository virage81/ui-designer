import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';

export const TopMenu: React.FC = () => {
	return (
		<div>
			<AppBar position='static'>
				<Toolbar variant='dense'>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexGrow: 1 }}>
						<Button variant='tools' disableElevation>
							File
						</Button>
						<Button variant='tools' disableElevation>
							Edit
						</Button>
						<Button variant='tools' disableElevation>
							All Projects
						</Button>
					</Box>
					<Box>
						<Typography noWrap sx={{ color: 'var(--color-muted)' }}>
							Untitled Project
						</Typography>
					</Box>
				</Toolbar>
			</AppBar>
		</div>
	);
};
