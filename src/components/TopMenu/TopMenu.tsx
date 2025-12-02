import { AppBar, Box, Button, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useProject } from '@shared/hooks/useProject';
import { useExportPNG } from '@shared/hooks/useExport';
import { House } from 'lucide-react';
import { useNavigate, useParams} from 'react-router-dom';
import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '@store/index';
import { updateProject } from '@store/slices/projectsSlice';
import {toggleCreateProjectModal} from "@store/slices/modalsSlice.ts";
import { validateProjectName } from '@shared/utils/projectNameValidation';
import {useCanvasContext} from "@/contexts/CanvasContext.tsx";
import type {Layer} from "@shared/types/project.ts";

export const TopMenu: React.FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const currentProject = useProject();
	const projects = useSelector((state: RootState) => state.projects.projects);
	const exportPNG = useExportPNG();

	const { id: projectId } = useParams<{ id: string }>(); // Add this
	const { canvases } = useCanvasContext(); // Add this
	const layersByProject = useSelector((state: RootState) => state.projects.layers);

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

	const handleSave = async () => {
		if (!currentProject || !projectId) return;

		const projectLayers = layersByProject[projectId] ?? [];
		if (!projectLayers.length) {
			handleFileMenuClose();
			return;
		}

		const canvasesRef: Record<string, HTMLCanvasElement> = {};
		projectLayers.forEach((layer: Layer) => {
			const canvas = canvases[layer.id];
			if (canvas) canvasesRef[layer.id] = canvas;
		});

		if (!Object.keys(canvasesRef).length) {
			handleFileMenuClose();
			return;
		}

		const tempCanvas = document.createElement('canvas');
		const dpr = window.devicePixelRatio || 1;
		const PREVIEW_SIZE = 300;
		const previewScale = Math.min(PREVIEW_SIZE / currentProject.width, PREVIEW_SIZE / currentProject.height);
		const previewWidth = currentProject.width * previewScale;
		const previewHeight = currentProject.height * previewScale;

		tempCanvas.width = Math.floor(previewWidth * dpr);
		tempCanvas.height = Math.floor(previewHeight * dpr);
		tempCanvas.style.width = `${previewWidth}px`;
		tempCanvas.style.height = `${previewHeight}px`;

		const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) return;

		ctx.scale(dpr, dpr);
		ctx.imageSmoothingEnabled = false;
		ctx.imageSmoothingQuality = 'high';
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, previewWidth, previewHeight);

		const visibleLayers = projectLayers
			.filter(l => !l.hidden && canvasesRef[l.id])
			.sort((a, b) => a.zIndex - b.zIndex);

		visibleLayers.forEach(layer => {
			const canvas = canvasesRef[layer.id];
			ctx.save();
			ctx.globalAlpha = layer.opacity / 100;
			ctx.drawImage(canvas, 0, 0, previewWidth, previewHeight);
			ctx.restore();
		});

		const previewDataUrl = tempCanvas.toDataURL('image/png', 0.5);

		dispatch(updateProject({
			id: currentProject.id,
			preview: previewDataUrl
		}));

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
