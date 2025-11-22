import { Box, Button, Card, Typography } from '@mui/material';
import { HomeIcon } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
	const navigate = useNavigate();

	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				maxWidth: '100%',
				bgcolor: 'var(--main-bg)',
			}}>
			<Card
				sx={{
					textAlign: 'center',
					p: 4,
					border: '1px solid var(--header-border-color)',
					bgcolor: 'var(--tab-bg)',
				}}>
				<Typography component='h1' variant='h1' fontWeight='bold' sx={{ mb: 2, color: 'var(--color-muted)' }}>
					404
				</Typography>

				<Typography variant='h5' gutterBottom textAlign='center' sx={{ color: 'var(--color-muted)' }}>
					Страница не найдена
				</Typography>

				<Typography
					variant='body1'
					color='text.secondary'
					textAlign='center'
					sx={{ mb: 3, color: 'var(--color-muted)' }}>
					Извините, запрашиваемая страница не существует или была перемещена.
				</Typography>

				<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
					<Button variant='contained' startIcon={<HomeIcon />} onClick={() => navigate('/')}>
						Вернуться на главную
					</Button>
				</Box>
			</Card>
		</Box>
	);
};
