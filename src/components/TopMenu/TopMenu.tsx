import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';

export const TopMenu: React.FC = () => {
	return (
		<div>
			<AppBar
				position='static'
				sx={{
					backgroundColor: 'var(--header-bg)',
					borderColor: 'var(--header-border-color)',
					borderWidth: 1,
					borderStyle: 'solid',
					color: 'var(--color)',
					boxShadow: 0,
				}}>
				<Toolbar variant='dense'>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexGrow: 1 }}>
						<Button
							disableElevation
							sx={{
								minWidth: 'auto',
								color: 'var(--color)',
								padding: '3px 10px',
								textTransform: 'none',
								backgroundColor: 'transparent',
								':hover': { backgroundColor: 'var(--hover-bg)', color: 'var(--hover-color)' },
							}}>
							File
						</Button>
						<Button
							disableElevation
							sx={{
								minWidth: 'auto',
								color: 'var(--color)',
								padding: '3px 10px',
								textTransform: 'none',
								backgroundColor: 'transparent',
								':hover': { backgroundColor: 'var(--hover-bg)', color: 'var(--hover-color)' },
							}}>
							Edit
						</Button>
						<Button
							disableElevation
							sx={{
								minWidth: 'auto',
								color: 'var(--color)',
								padding: '3px 10px',
								textTransform: 'none',
								backgroundColor: 'transparent',
								':hover': { backgroundColor: 'var(--hover-bg)', color: 'var(--hover-color)' },
							}}>
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
