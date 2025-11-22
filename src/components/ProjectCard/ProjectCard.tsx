import { DeleteConfirmModal } from '@components/DeleteConfirmModal';
import { DeleteOutlineOutlined, FolderOpenOutlined } from '@mui/icons-material';
import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import type { Project } from '@shared/types/project';
import { useState } from 'react';
import { Placeholder } from './components';

export const ProjectCard: React.FC<Project> = ({ preview, name, date }) => {
	const [openModal, setOpenModal] = useState(false);

	return (
		<>
			<Card
				sx={{
					maxWidth: 290,
					borderRadius: 3,
					border: '1px solid var(--header-border-color)',
					backgroundColor: 'var(--header-bg)',
					paddingBottom: 3,
				}}>
				{!preview ? (
					<Placeholder />
				) : (
					<CardMedia
						sx={{
							borderTopLeftRadius: 8,
							borderTopRightRadius: 8,
						}}
						component='img'
						alt={name}
						height='150'
						image={preview}
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
						{name}
					</Typography>
					<Typography variant='body2' sx={{ fontSize: '0.87rem', color: 'var(--color-dark)' }}>
						Обновлено: {date}
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
						onClick={() => setOpenModal(true)}>
						Удалить
					</Button>
				</CardActions>
			</Card>
			<DeleteConfirmModal open={openModal} handleClose={() => setOpenModal(false)} projectName={name} />
		</>
	);
};
