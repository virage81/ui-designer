import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import { Placeholder } from './components';
import { DeleteOutlineOutlined, FolderOpenOutlined } from '@mui/icons-material';

interface ProjectCardProps {
	id: number;
	title: string;
	updatedAt: string;
	previewUrl?: string | null;
	openModal: (title: string) => void;
} // TODO удалить (для теста)

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  updatedAt,
  previewUrl = null,
	openModal
}) => {
	return (
		<Card
			sx={{
				maxWidth: 290,
				borderRadius: 3,
				backgroundColor: 'var(--header-bg)',
				py: 3,
			}}>
			{!previewUrl ? (
				<Placeholder />
			) : (
				<CardMedia
					sx={{
						borderTopLeftRadius: 8,
						borderTopRightRadius: 8,
					}}
					component='img'
					alt={title}
					height='150'
					image={previewUrl}
				/>
			)}

			<CardContent sx={{ pb: 0.2 }}>
				<Typography
					component='h3'
					sx={{
						fontSize: '1.1rem',
						fontWeight: 600,
						color: 'var(--color)',
						mt: 1.5,
					}}>
					{title}
				</Typography>
				<Typography variant='body2' sx={{ fontSize: '0.87rem', color: 'var(--color-dark)' }}>
					Обновлено: {updatedAt}
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
					}}
					onClick={() => openModal(title)}
					>
					Удалить
				</Button>
			</CardActions>
		</Card>
	);
};
