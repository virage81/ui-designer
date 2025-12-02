import { AppBar, Box, Button, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useProject } from '@shared/hooks/useProject';
import { useExportPNG } from '@shared/hooks/useExport';
import { House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '@store/index';
import { updateProject } from '@store/slices/projectsSlice';
import {toggleCreateProjectModal} from "@store/slices/modalsSlice.ts";
import { validateProjectName } from '@shared/utils/projectNameValidation';

export const TopMenu: React.FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const currentProject = useProject();
	const projects = useSelector((state: RootState) => state.projects.projects);
	const exportPNG = useExportPNG();

	const [fileAnchorEl, setFileAnchorEl] = useState<null | HTMLElement>(null);
	const fileMenuOpen = Boolean(fileAnchorEl);

	const [isEditing, setIsEditing] = useState(false);
	const [projectName, setProjectName] = useState(currentProject.name);
	const [projectNameError, setProjectNameError] = useState('');
	const [originalName, setOriginalName] = useState(currentProject.name);

	const startEditing = () => {
		setOriginalName(currentProject.name);
		setProjectName(currentProject.name);
		setProjectNameError('');
		setIsEditing(true);
	};

	const validateName = (name: string): boolean => {
		const error = validateProjectName(name, projects, currentProject.id);
		setProjectNameError(error);
		return error === '';
	};

	const saveName = () => {
		if (!validateName(projectName)) return;
		if (projectName.trim() !== currentProject.name) {
			dispatch(updateProject({ id: currentProject.id, name: projectName.trim() }));
		}
		setIsEditing(false);
	};

	const cancelEditing = () => {
		setProjectName(originalName);
		setProjectNameError('');
		setIsEditing(false);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			saveName();
		} else if (e.key === 'Escape') {
			cancelEditing();
		}
	};

	const handleBlur = () => {
		if (validateName(projectName)) {
			saveName();
		} else {
			cancelEditing();
		}
	};

	const handleFileMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
		setFileAnchorEl(event.currentTarget);
	};

	const handleFileMenuClose = () => {
		setFileAnchorEl(null);
	};

	const handleNewProject = () => {
		dispatch(toggleCreateProjectModal())
		handleFileMenuClose();
	};

	const handleSave = () => {
		//todo: сохранение проекта
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
						{isEditing ? (
							<>
								<input
									type='text'
									value={projectName}
									onChange={(e) => {
										setProjectName(e.target.value);
										if (projectNameError) validateName(e.target.value);
									}}
									onKeyDown={handleKeyDown}
									onBlur={handleBlur}
									autoFocus
									style={{
										fontSize: '1rem',
										color: projectNameError ? 'red' : 'var(--color-muted)',
										backgroundColor: 'transparent',
										border: 'none',
										borderBottom: projectNameError ? '2px solid red' : '1px solid var(--color-muted)',
										outline: 'none',
										width: '100%',
										cursor: 'text'
									}}
									aria-invalid={!!projectNameError}
									aria-describedby='project-name-error'
								/>
								{projectNameError && (
									<Typography
										id='project-name-error'
										variant='caption'
										sx={{ color: 'red', userSelect: 'none', mt: 0.3, display: 'block' }}
									>
										{projectNameError}
									</Typography>
								)}
							</>
						) : (
							<Typography
								noWrap
								sx={{ color: 'var(--color-muted)', cursor: 'pointer', paddingLeft: '20px' }}
								onClick={startEditing}
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
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
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
				<MenuItem onClick={handleNewProject}>
					Новый проект
				</MenuItem>
				<MenuItem onClick={handleSave}>
					Сохранить
				</MenuItem>
				<MenuItem onClick={handleExportPng}>
					Экспортировать в png
				</MenuItem>
			</Menu>
		</>
	);
};
