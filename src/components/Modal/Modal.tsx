import type { RootState } from '@/store';
import CloseIcon from '@mui/icons-material/Close';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	Typography,
} from '@mui/material';
import type { Project } from '@shared/types/project';
import { validateProjectName } from '@shared/utils/projectNameValidation';
import { closeCreateProjectModal } from '@store/slices/modalsSlice';
import { createProject } from '@store/slices/projectsSlice';
import { type ChangeEvent, type FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNewProjectName } from './utils';

type NewProject = Omit<Project, 'id' | 'date'>;

const DEFAULT_NAME = 'Проект';
const DEFAULT_SIZE = 800;

export const Modal: FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const projects = useSelector((state: RootState) => state.projects.projects);
	const newProjectName = getNewProjectName(DEFAULT_NAME, projects);
	const isCreateProjectModalOpen = useSelector((state: RootState) => state.modals.isCreateProjectModalOpen);

	const [pendingName, setPendingName] = useState<string | null>(null);

	const [projectName, setProjectName] = useState<string>(newProjectName);
	const [width, setWidth] = useState<number | string>(DEFAULT_SIZE);
	const [height, setHeight] = useState<number | string>(DEFAULT_SIZE);

	const [projectNameError, setProjectNameError] = useState<string>('');
	const [widthError, setWidthError] = useState<string>('');
	const [heightError, setHeightError] = useState<string>('');

	const resetForm: () => void = useCallback((): void => {
		setProjectName(newProjectName);
		setWidth(DEFAULT_SIZE);
		setHeight(DEFAULT_SIZE);
		setProjectNameError('');
		setWidthError('');
		setHeightError('');
	}, [newProjectName]);

	useEffect(() => {
		if (isCreateProjectModalOpen) {
			const id = setTimeout(resetForm, 0);
			return (): void => clearTimeout(id);
		}
	}, [isCreateProjectModalOpen, resetForm]);

	const validateInput = (value: string, field: string): void => {
		switch (field) {
			case 'projectName': {
				const error = validateProjectName(value, projects);
				setProjectNameError(error);
				if (!error) {
					setProjectName(value);
				}
				break;
			}
			case 'width': {
				const num: number = Number(value);
				setWidth(value);

				if (!Number.isInteger(num) || num < 0) {
					setWidthError('Введите целое положительное число');
				} else if (num < 100) {
					setWidthError('Минимальная ширина холста: 100px');
				} else {
					setWidthError('');
				}
				break;
			}
			case 'height': {
				const num: number = Number(value);
				setHeight(value);

				if (!Number.isInteger(num) || num < 0) {
					setHeightError('Введите целое положительное число');
				} else if (num < 100) {
					setHeightError('Минимальная высота холста: 100px');
				} else {
					setHeightError('');
				}
				break;
			}
			default:
				break;
		}
	};

	useEffect(() => {
		if (!pendingName) return;

		const created: Project | undefined = projects.find((p: Project) => p.name === pendingName);
		if (created?.id) {
			if (location.pathname.startsWith('/projects')) {
				navigate(`/projects/${created.id}`, { replace: true });
			} else {
				navigate(`/projects/${created.id}`);
			}
		}

		return () => {
			setPendingName(null);
		};
	}, [projects, pendingName, navigate, location.pathname]);

	useEffect(() => {
		return () => {
			dispatch(closeCreateProjectModal());
		};
	}, [dispatch]);

	const handleCreate: () => void = (): void => {
		console.log('enter');
		if (!projectNameError && !widthError && !heightError) {
			const trimmedName = projectName.trim();
			const newProject: NewProject = {
				name: trimmedName,
				width: Number(width),
				height: Number(height),
				preview: '',
				history: null,
				layers: [],
			} as Omit<Project, 'id' | 'date'>;

			if (projects.some((p: Project) => p.name === trimmedName)) {
				setProjectNameError('Проект с таким именем уже существует');
			} else {
				setPendingName(trimmedName);
				dispatch(createProject(newProject));
				dispatch(closeCreateProjectModal());
			}
		}
	};

	return (
		<Dialog
			open={isCreateProjectModalOpen}
			onClose={() => dispatch(closeCreateProjectModal())}
			disableRestoreFocus
			key={isCreateProjectModalOpen ? 'modal-open' : 'modal-closed'}>
			<Box sx={{ position: 'relative', paddingBottom: 2 }}>
				<DialogTitle aria-labelledby='modal-title' sx={{ position: 'relative' }}>
					Создать новый проект
					<IconButton
						aria-label='close'
						onClick={() => dispatch(closeCreateProjectModal())}
						sx={{
							position: 'absolute',
							right: 10,
							top: 8,
							color: 'grey.500',
							backgroundColor: 'transparent',
							'&:hover': { backgroundColor: 'transparent', filter: 'brightness(1.3)' },
						}}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Box component='form' onSubmit={handleCreate}>
						<Typography sx={{ color: '#9fa5b5', marginBottom: 2 }}>Укажите параметры для нового проекта</Typography>
						<TextField
							name='projectName'
							label='Название проекта'
							fullWidth
							margin='normal'
							value={projectName}
							autoComplete='off'
							onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
								validateInput(e.target.value, e.target.name)
							}
							error={!!projectNameError}
							helperText={projectNameError}
						/>
						<TextField
							name='width'
							label='Ширина холста (px)'
							type='number'
							fullWidth
							margin='normal'
							value={width}
							slotProps={{ htmlInput: { min: 100 } }}
							onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
								validateInput(e.target.value, e.target.name)
							}
							error={!!widthError}
							helperText={widthError}
						/>
						<TextField
							name='height'
							label='Высота холста (px)'
							type='number'
							fullWidth
							margin='normal'
							value={height}
							slotProps={{ htmlInput: { min: 100 } }}
							onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
								validateInput(e.target.value, e.target.name)
							}
							error={!!heightError}
							helperText={heightError}
						/>
						<DialogActions>
							<Button
								onClick={() => dispatch(closeCreateProjectModal())}
								variant='outlined'
								type='button'
								sx={{
									borderColor: theme => (theme.palette.mode === 'dark' ? '#31313A' : 'rgb(196,196,196)'),
									textTransform: 'none',
									color: theme => (theme.palette.mode === 'dark' ? '#FFF' : '#000'),
									'&:hover': {
										backgroundColor: theme => (theme.palette.mode === 'dark' ? '#31313A' : null),
										borderColor: theme => (theme.palette.mode !== 'dark' ? '#000' : null),
									},
								}}>
								Отмена
							</Button>
							<Button
								variant='contained'
								type='submit'
								autoFocus
								disabled={!!projectNameError || !!widthError || !!heightError}
								sx={{ textTransform: 'none' }}>
								Создать
							</Button>
						</DialogActions>
					</Box>
				</DialogContent>
			</Box>
		</Dialog>
	);
};
