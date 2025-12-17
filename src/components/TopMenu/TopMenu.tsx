import { useCanvasContext } from '@/contexts/useCanvasContext.ts';
import { AppBar, Box, Button, CircularProgress, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useExportPNG } from '@shared/hooks/useExport';
import { useProject } from '@shared/hooks/useProject';
import { useProjectNameEditing } from '@shared/hooks/useProjectNameEditing';
import { useSaveProjectPreview } from '@shared/hooks/useSavePreview.tsx';
import { type RootState } from '@store/index';
import { toggleCreateProjectModal } from '@store/slices/modalsSlice.ts';
import { resetPreviewSave } from '@store/slices/projectsSlice';
import { BadgeCheckIcon, House } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

export const TopMenu: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const currentProject = useProject();
	const projects = useSelector((state: RootState) => state.projects.projects);
	const exportPNG = useExportPNG();
	const { id: projectId } = useParams<{ id: string }>();
	const { canvases } = useCanvasContext();
	const lastPreviewSavedAt = useSelector((state: RootState) => state.projects.save.lastPreviewSavedAt);
	const lastSaveWasManual = useSelector((state: RootState) => state.projects.save.lastSaveWasManual);
	const layersByProject = useSelector((state: RootState) => state.projects.layers);
	const projectLayers = layersByProject[projectId ?? ''] ?? [];
	const saveProjectPreview = useSaveProjectPreview(currentProject, projectLayers, canvases);

	const editing = useProjectNameEditing({
		projectId: currentProject.id,
		initialName: currentProject.name,
		projects,
	});

	const [isInitialMount, setIsInitialMount] = useState<boolean>(true);
	const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
	const [fileAnchorEl, setFileAnchorEl] = useState<null | HTMLElement>(null);
	const fileMenuOpen = Boolean(fileAnchorEl);

	const handleFileMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
		setFileAnchorEl(event.currentTarget);
	};

	const handleFileMenuClose = () => {
		setFileAnchorEl(null);
	};

	const handleNewProject = () => {
		dispatch(toggleCreateProjectModal());
		handleFileMenuClose();
		saveProjectPreview();
	};

	const handleSave = () => {
		saveProjectPreview(true);
		handleFileMenuClose();
	};

	const handleExportPng = () => {
		exportPNG();
		handleFileMenuClose();
	};

	useEffect(() => {
		if (isInitialMount) {
			dispatch(resetPreviewSave());
			setIsInitialMount(false);
		}
	}, [dispatch, isInitialMount]);

	useEffect(() => {
		if (isInitialMount || !lastPreviewSavedAt) return;

		setSaveStatus('saved');

		const duration = lastSaveWasManual ? 1500 : 1000;
		const timer = setTimeout(() => setSaveStatus('idle'), duration);

		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lastPreviewSavedAt, lastSaveWasManual, isInitialMount]);

	return (
		<>
			<AppBar position='static' sx={{ '& .MuiToolbar-root': { pr: '10px', pl: 0 } }}>
				<Toolbar variant='dense'>
					<Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
						<Button sx={{ width: '63px' }} variant='graphic-tools' disableElevation onClick={() => navigate('/')}>
							<House />
						</Button>
						<Button variant='tools' disableElevation onClick={handleFileMenuClick} sx={{ textTransform: 'none' }}>
							Файл
						</Button>

						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
							{saveStatus == 'saved' && !lastSaveWasManual && (
								<CircularProgress size={16} sx={{ color: 'var(--color-muted)' }} />
							)}
							<Box
								sx={{
									color: 'var(--color-muted)',
									opacity: saveStatus === 'saved' && lastSaveWasManual ? 1 : 0,
									transition: 'opacity 200ms ease-in-out',
									pointerEvents: 'none',
								}}>
								<Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
									<BadgeCheckIcon size={16} />
									Сохранено
								</Typography>
							</Box>
						</Box>
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
										cursor: 'text',
									}}
									aria-invalid={!!editing.projectNameError}
									aria-describedby='project-name-error'
								/>
								{editing.projectNameError && (
									<Typography
										id='project-name-error'
										variant='caption'
										sx={{ color: 'red', userSelect: 'none', mt: 0.3, display: 'block' }}>
										{editing.projectNameError}
									</Typography>
								)}
							</>
						) : (
							<Typography
								noWrap
								sx={{ color: 'var(--color-muted)', cursor: 'pointer', paddingLeft: '20px' }}
								onClick={editing.startEditing}
								title='Нажмите для редактирования'>
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
				}}>
				<MenuItem onClick={handleNewProject}>Новый проект</MenuItem>
				<MenuItem onClick={handleSave}>Сохранить</MenuItem>
				<MenuItem onClick={handleExportPng}>Экспортировать в png</MenuItem>
			</Menu>
		</>
	);
};
