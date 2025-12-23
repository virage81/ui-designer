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
import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { HelpModal } from './components';

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
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
	const fileMenuOpen = Boolean(fileAnchorEl);

	const handleFileMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
		setFileAnchorEl(event.currentTarget);
	};

	const handleFileMenuClose = () => {
		setFileAnchorEl(null);
	};

	const handleNewProject = useCallback(() => {
		dispatch(toggleCreateProjectModal());
		handleFileMenuClose();
		saveProjectPreview();
	}, [dispatch, saveProjectPreview]);

	const handleSave = useCallback(() => {
		saveProjectPreview(true);
		handleFileMenuClose();
	}, [saveProjectPreview]);

	const handleExportPng = useCallback(() => {
		exportPNG();
		handleFileMenuClose();
	}, [exportPNG]);

	const handleOpenHelpModal = () => {
		setIsHelpModalOpen(true);
		handleFileMenuClose();
	};

	useEffect(() => {
		if (isInitialMount) {
			dispatch(resetPreviewSave());
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIsInitialMount(false);
		}
	}, [dispatch, isInitialMount]);

	useEffect(() => {
		if (isInitialMount || !lastPreviewSavedAt) return;

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setSaveStatus('saved');

		const duration = lastSaveWasManual ? 1500 : 1000;
		const timer = setTimeout(() => setSaveStatus('idle'), duration);

		return () => clearTimeout(timer);
	}, [lastPreviewSavedAt, lastSaveWasManual, isInitialMount]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;

			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
				return;
			}

			if (e.code === 'F1') {
				e.preventDefault();
				setIsHelpModalOpen(true);
				return;
			}

			if (e.ctrlKey && !e.shiftKey && !e.altKey) {
				switch (e.code) {
					case 'KeyS':
						e.preventDefault();
						handleSave();
						return;

					case 'KeyE':
						e.preventDefault();
						handleExportPng();
						return;

					default:
						break;
				}
			}

			if (e.ctrlKey && e.altKey && !e.shiftKey && e.code === 'KeyN') {
				e.preventDefault();
				handleNewProject();
				return;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleSave, handleExportPng, handleNewProject]);

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
					'& .MuiMenuItem-root': {
						display: 'flex',
						justifyContent: 'space-between',
						gap: '1rem',
						fontSize: '14px',
						'& span': {
							color: 'var(--color-muted)',
						},
					},
				}}>
				<MenuItem onClick={handleNewProject}>
					Новый проект <span>(Ctrl+Alt+N)</span>
				</MenuItem>
				<MenuItem onClick={handleSave}>
					Сохранить <span>(Ctrl+S)</span>
				</MenuItem>
				<MenuItem onClick={handleExportPng}>
					Экспортировать в png <span>(Ctrl+E)</span>
				</MenuItem>
				<MenuItem onClick={handleOpenHelpModal}>
					Горячие клавиши <span>(F1)</span>
				</MenuItem>
			</Menu>
			<HelpModal open={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
		</>
	);
};
