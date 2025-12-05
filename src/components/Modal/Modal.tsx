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
import { createProject } from '@store/slices/projectsSlice';
import { type ChangeEvent, type FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { Project } from '@shared/types/project';
import { useLocation, useNavigate } from 'react-router-dom';
import { closeCreateProjectModal } from '@store/slices/modalsSlice';

type NewProject = Omit<Project, 'id' | 'date'>;

const DEFAULT_NAME = 'Проект';
const DEFAULT_SIZE = 800;
const NAME_PATTERN = /^[A-Za-zА-Яа-яЁё0-9\s]+$/;

export const Modal: FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const projects = useSelector((state: RootState) => state.projects.projects);
	const isCreateProjectModalOpen = useSelector((state: RootState) => state.modals.isCreateProjectModalOpen);

	const [pendingName, setPendingName] = useState<string | null>(null);

	const [projectName, setProjectName] = useState<string>(DEFAULT_NAME);
	const [width, setWidth] = useState<number | string>(DEFAULT_SIZE);
	const [height, setHeight] = useState<number | string>(DEFAULT_SIZE);

	const [projectNameError, setProjectNameError] = useState<string>('');
	const [widthError, setWidthError] = useState<string>('');
	const [heightError, setHeightError] = useState<string>('');

	const resetForm: () => void = (): void => {
		setProjectName(DEFAULT_NAME);
		setWidth(DEFAULT_SIZE);
		setHeight(DEFAULT_SIZE);
		setProjectNameError('');
		setWidthError('');
		setHeightError('');
	};

	useEffect(() => {
		if (isCreateProjectModalOpen) {
			const id = setTimeout(resetForm, 0);
			return (): void => clearTimeout(id);
		}
	}, [isCreateProjectModalOpen]);

	const validateInput = (value: string, field: string): void => {
		switch (field) {
			case 'projectName': {
				if (value.length === 0) {
					setProjectNameError('Название обязательно');
				} else if (!NAME_PATTERN.test(value)) {
					setProjectNameError('Допустимы буквы и цифры');
				} else {
					setProjectNameError('');
				}
				setProjectName(value);
				break;
			}
			case 'width': {
				const num: number = Number(value);
				setWidth(value);
				if (!Number.isInteger(num) || num < 1) {
					setWidthError('Введите целое положительное число');
				} else {
					setWidthError('');
				}
				break;
			}
			case 'height': {
				const num: number = Number(value);
				setHeight(value);
				if (!Number.isInteger(num) || num < 1) {
					setHeightError('Введите целое положительное число');
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
						slotProps={{ htmlInput: { min: 0 } }}
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
						slotProps={{ htmlInput: { min: 0 } }}
						onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
							validateInput(e.target.value, e.target.name)
						}
						error={!!heightError}
						helperText={heightError}
					/>
				</DialogContent>
				<DialogActions sx={{ paddingRight: '24px', paddingLeft: '24px' }}>
					<Button
						onClick={() => dispatch(closeCreateProjectModal())}
						variant='outlined'
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
						onClick={handleCreate}
						variant='contained'
						disabled={!!projectNameError || !!widthError || !!heightError}
						sx={{ textTransform: 'none' }}>
						Создать
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	);
};
