import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useProject } from '@shared/hooks/useProject';
import { House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, type KeyboardEvent, type FocusEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '@store/index';
import { updateProject } from '@store/slices/projectsSlice'; // Ensure this action exists

export const TopMenu: React.FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const currentProject = useProject();
	const projects = useSelector((state: RootState) => state.projects.projects);

	const [isEditing, setIsEditing] = useState(false);
	const [projectName, setProjectName] = useState(currentProject.name);
	const [projectNameError, setProjectNameError] = useState('');
	const [originalName, setOriginalName] = useState(currentProject.name);

	useEffect(() => {
		setProjectName(currentProject.name);
		setOriginalName(currentProject.name);
		setProjectNameError('');
		setIsEditing(false);
	}, [currentProject.name]);

	const startEditing = () => {
		setOriginalName(currentProject.name);
		setProjectName(currentProject.name);
		setProjectNameError('');
		setIsEditing(true);
	};

	const validateName = (name: string) => {
		const trimmed = name.trim();
		if (trimmed.length === 0) {
			setProjectNameError('Название обязательно');
			return false;
		}
		if (projects.some(p => p.name === trimmed && p.id !== currentProject.id)) {
			setProjectNameError('Проект с таким именем уже существует');
			return false;
		}
		setProjectNameError('');
		return true;
	};

	const saveName = () => {
		if (!validateName(projectName)) {
			return;
		}

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

	const handleBlur = (_e: FocusEvent<HTMLInputElement>) => {
		if (validateName(projectName)) {
			saveName();
		} else {
			cancelEditing();
		}
	};

	return (
		<AppBar position='static'>
			<Toolbar variant='dense'>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexGrow: 1 }}>
					<Button variant='graphic-tools' disableElevation onClick={() => navigate('/')}>
						<House />
					</Button>
					<Button variant='tools' disableElevation>
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
							sx={{ color: 'var(--color-muted)', cursor: 'pointer',  paddingLeft: '20px'  }}
							onClick={startEditing}
							title="Нажмите для редактирования"
						>
							{currentProject?.name}
						</Typography>
					)}
				</Box>
			</Toolbar>
		</AppBar>
	);
};
