import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

export const MainHeader: React.FC = () => {
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
				<Container maxWidth='lg'>
					<Toolbar>
						<Box sx={{ flexGrow: 1 }}>
							<Typography
								noWrap
								component='div'
								sx={{
									flexGrow: 1,
									fontSize: '1.5rem',
									fontWeight: 600,
								}}>
								Графический редактор
							</Typography>
						</Box>

						<Button
							variant='contained'
							startIcon={<Add />}
							sx={{
								textTransform: 'none',
							}}>
							Создать проект
						</Button>
					</Toolbar>
				</Container>
			</AppBar>
		</div>
	);
};
