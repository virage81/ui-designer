import { DeleteConfirmModal } from '@components/DeleteConfirmModal';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import type { Project } from '@shared/types/project';
import { FolderOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '@store/index';
import { useProjectNameEditing } from '@shared/hooks/useProjectNameEditing';
import { Placeholder } from './components';

export const ProjectCard: React.FC<Project> = ({ id, preview, name, date }) => {
	const navigate = useNavigate();
	const projects = useSelector((state: RootState) => state.projects.projects);
	const [openModal, setOpenModal] = useState(false);

	const editing = useProjectNameEditing({ projectId: id, initialName: name, projects });

	return (
		<>
			<Card sx={{ maxWidth: 290, borderRadius: 3, border: '1px solid var(--header-border-color)', backgroundColor: 'var(--header-bg)', paddingBottom: 3 }}>
				{!preview ? <Placeholder /> : (
					<CardMedia
						sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
						component='img'
						alt={name}
						height='150'
						image={preview}
					/>
				)}

				<CardContent sx={{ pb: 0.2 }}>
					<Box sx={{ maxWidth: 250 }}>
						<Box
							sx={{
								minHeight: '44px',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								px: 0.5,
								py: 1
							}}
						>
							{editing.isEditing ? (
								<>
									<input
										type='text'
										value={editing.projectName}
										onChange={(e) => {
											editing.setProjectName(e.target.value);
											if (editing.projectNameError) editing.validateName(e.target.value);
										}}
										onKeyDown={editing.handleKeyDown}
										onBlur={editing.handleBlur}
										autoFocus
										style={{
											fontSize: '1.1rem',
											fontWeight: 600,
											fontFamily: 'inherit',
											letterSpacing: 'inherit',
											lineHeight: 1.2,
											color: editing.projectNameError ? 'red' : 'var(--color)',
											backgroundColor: 'transparent',
											border: 'none',
											borderBottom: editing.projectNameError ? '2px solid red' : '1px solid var(--color-muted)',
											outline: 'none',
											width: '100%',
											marginBottom: editing.projectNameError ? '2px' : 0,
											cursor: 'text',
											appearance: 'none',
											WebkitAppearance: 'none',
											padding: 0,
											margin: 0
										}}
										aria-invalid={!!editing.projectNameError}
										aria-describedby='project-name-error'
									/>
									{editing.projectNameError && (
										<Typography
											id='project-name-error'
											variant='caption'
											sx={{
												color: 'red',
												userSelect: 'none',
												mt: 0,
												lineHeight: 1,
												minHeight: '16px'
											}}
										>
											{editing.projectNameError}
										</Typography>
									)}
								</>
							) : (
								<Typography
									component='h3'
									sx={{
										fontSize: '1.1rem',
										fontWeight: 600,
										color: 'var(--color)',
										cursor: 'pointer',
										lineHeight: 1.2,
									}}
									onClick={editing.startEditing}
									title="Нажмите для редактирования"
								>
									{name}
								</Typography>
							)}
						</Box>
					</Box>
					<Typography variant='body2' sx={{ fontSize: '0.87rem', color: 'var(--color-dark)', mt: 0.5 }}>
						Обновлено: {date}
					</Typography>
				</CardContent>

				<CardActions sx={{ px: 2 }}>
					<Button
						onClick={() => navigate(`/projects/${id}`)}
						variant='contained'
						startIcon={<FolderOpen size={18} />}
						sx={{ textTransform: 'none', flex: 3 }}
					>
						Открыть
					</Button>
					<Button
						variant='contained'
						color='error'
						startIcon={<Trash2 size={18} />}
						sx={{ textTransform: 'none', flex: 2 }}
						onClick={() => setOpenModal(true)}
					>
						Удалить
					</Button>
				</CardActions>
			</Card>
			<DeleteConfirmModal open={openModal} handleClose={() => setOpenModal(false)} projectName={name} projectId={id} />
		</>
	);
};
