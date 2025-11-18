import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import { Placeholder } from './components';
import { DeleteOutlineOutlined, FolderOpenOutlined } from '@mui/icons-material';

// const imageUrl = 'https://wallpaper.forfun.com/fetch/11/11a73adf58ad1cbb6ee08f4971a0027a.jpeg' //TODO удалить (для теста)
const imageUrl = ''; //TODO удалить (для теста)

export const ProjectCard = () => {
	return (
		<Card
			sx={{
				maxWidth: 295,
				borderRadius: 3,
				backgroundColor: 'var(--header-bg)',
				py: 3,
			}}>
			{!imageUrl ? (
				<Placeholder />
			) : (
				<CardMedia
					sx={{
						borderTopLeftRadius: 8,
						borderTopRightRadius: 8,
					}}
					component='img'
					alt='green iguana'
					height='190'
					image={imageUrl}
				/>
			)}

			<CardContent>
				<Typography
					component='h3'
					sx={{
						fontSize: '1.1rem',
						fontWeight: 600,
						color: 'var(--color)',
					}}>
					Мой первый проект
				</Typography>
				<Typography variant='body2' sx={{ fontSize: '0.87rem', color: 'var(--color-dark)' }}>
					Обновлено: 18 нояб. 2025г.
				</Typography>
			</CardContent>
			<CardActions sx={{ px: 2 }}>
				<Button
					variant='contained'
					startIcon={<FolderOpenOutlined />}
					sx={{
						textTransform: 'none',
						flex: 3,
					}}>
					Открыть
				</Button>
				<Button
					variant='contained'
					color='error'
					startIcon={<DeleteOutlineOutlined />}
					sx={{
						textTransform: 'none',
						flex: 2,
					}}>
					Удалить
				</Button>
			</CardActions>
		</Card>
	);
};
