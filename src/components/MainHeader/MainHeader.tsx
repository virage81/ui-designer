import { Add } from '@mui/icons-material';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';

interface MainHeader {
	onCreateClick: () => void;
}

export const MainHeader: React.FC<MainHeader> = ({ onCreateClick }) => {
	return (
		<div>
			<AppBar position='static'>
				<Container maxWidth='lg'>
					<Toolbar>
						<Box sx={{ flexGrow: 1 }}>
							<Typography noWrap component='div' sx={{ flexGrow: 1, fontSize: '1.5rem', fontWeight: 600 }}>
								Графический редактор
							</Typography>
						</Box>

						<Button variant='contained' startIcon={<Add />} sx={{ textTransform: 'none' }} onClick={onCreateClick}>
							Создать проект
						</Button>
					</Toolbar>
				</Container>
			</AppBar>
		</div>
	);
};
