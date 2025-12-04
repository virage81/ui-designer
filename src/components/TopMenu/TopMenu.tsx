import { AppBar, Box, Button, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useProject } from '@shared/hooks/useProject';
import { useExportPNG } from '@shared/hooks/useExport';
import { House } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, type MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '@store/index';
import { toggleCreateProjectModal } from '@store/slices/modalsSlice.ts';
import { useSaveProjectPreview } from '@shared/hooks/useSavePreview.tsx';
import { useCanvasContext } from '@/contexts/useCanvasContext.ts';
import { useSaveProject } from '@shared/hooks/useSaveProject.ts';
import { useProjectNameEditing } from '@shared/hooks/useProjectNameEditing';

export const TopMenu: React.FC = () => {
	const navigate = useNavigate();
	const currentProject = useProject();
	const projects = useSelector((state: RootState) => state.projects.projects);
	const exportPNG = useExportPNG();
	const saveProject = useSaveProject();

	const { id: projectId } = useParams<{ id: string }>();
	const { canvases } = useCanvasContext();
	const layersByProject = useSelector((state: RootState) => state.projects.layers);
	const projectLayers = layersByProject[projectId ?? ''] ?? [];
	const saveProjectPreview = useSaveProjectPreview(currentProject, projectLayers, canvases);

	const editing = useProjectNameEditing({
		projectId: currentProject.id,
		initialName: currentProject.name,
		projects
	});

	const [fileAnchorEl, setFileAnchorEl] = useState<null | HTMLElement>(null);
	const fileMenuOpen = Boolean(fileAnchorEl);

	const handleFileMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
		setFileAnchorEl(event.currentTarget);
	};

	const handleFileMenuClose = () => {
		setFileAnchorEl(null);
	};

	const handleNewProject = () => {
		toggleCreateProjectModal();
		handleFileMenuClose();
	};

	const handleSave = async () => {
		saveProjectPreview();
		await saveProject();
		handleFileMenuClose();
	};

	const handleExportPng = () => {
		exportPNG();
		handleFileMenuClose();
	};

	return (
		<>
			<AppBar position='static' sx={{ "& .MuiToolbar-root": { pr: '10px', pl: 0 } }}>
				<Toolbar variant='dense'>
					<Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
						<Button
							sx={{ width: '63px' }}
							variant='graphic-tools'
							disableElevation
							onClick={() => navigate('/')}
						>
							<House />
						</Button>
						<Button
							variant='tools'
							disableElevation
							onClick={handleFileMenuClick}
							sx={{ textTransform: 'none' }}
						>
							Файл
						</Button>
					</Box>

					<Box sx={{ maxWidth: 300 }}>
						{editing.isEditing ? (
							<>
								<input
									type='text'
									value={editing.projectName}
									onChange={editing.handleChange}
									onKeyDown={editing.handleKeyDown}
									onBlur={editing.handleBlur}
									autoFocus
									style={{
										fontSize: '1rem',
										fontFamily: 'inherit',
										letterSpacing: 'inherit',
										color: editing.projectNameError ? 'red' : 'var(--color-muted)',
										backgroundColor: 'transparent',
										border: 'none',
										borderBottom: editing.projectNameError ? '2px solid red' : '1px solid var(--color-muted)',
										outline: 'none',
										width: '100%',
										cursor: 'text'
									}}
									aria-invalid={!!editing.projectNameError}
									aria-describedby='project-name-error'
								/>
								{editing.projectNameError && (
									<Typography
										id='project-name-error'
										variant='caption'
										sx={{ color: 'red', userSelect: 'none', mt: 0.3, display: 'block' }}
									>
										{editing.projectNameError}
									</Typography>
								)}
							</>
						) : (
							<Typography
								noWrap
								sx={{ color: 'var(--color-muted)', cursor: 'pointer', paddingLeft: '20px' }}
								onClick={editing.startEditing}
								title="Нажмите для редактирования"
							>
								{currentProject?.name}
							</Typography>
						)}
					</Box>
				</Toolbar>
			</AppBar>

			<Menu
				anchorEl={fileAnchorEl}
				open={fileMenuOpen}
				onClose={handleFileMenuClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				sx={{
					mt: '11px',
					ml: '1px',
					'& .MuiPaper-root': {
						borderRadius: 2,
						backgroundColor: 'var(--header-bg)',
						backgroundImage: 'none',
						border: '1px solid var(--header-border-color)',
					},
					'& .MuiMenu-list': {
						padding: 0,
					},
				}}
			>
				<MenuItem onClick={handleNewProject}>Новый проект</MenuItem>
				<MenuItem onClick={handleSave}>Сохранить</MenuItem>
				<MenuItem onClick={handleExportPng}>Экспортировать в png</MenuItem>
			</Menu>
		</>
	);
};
