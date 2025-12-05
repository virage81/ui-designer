import { type ChangeEvent, type KeyboardEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { type RootState } from '@store/index';
import { updateProject } from '@store/slices/projectsSlice';
import { validateProjectName } from '@shared/utils/projectNameValidation';

interface UseProjectNameEditingProps {
	projectId: string;
	initialName: string;
	projects: RootState['projects']['projects'];
}

export const useProjectNameEditing = ({ projectId, initialName, projects }: UseProjectNameEditingProps) => {
	const dispatch = useDispatch();

	const [isEditing, setIsEditing] = useState(false);
	const [projectName, setProjectName] = useState(initialName);
	const [projectNameError, setProjectNameError] = useState('');

	const startEditing = () => {
		setProjectName(initialName);
		setProjectNameError('');
		setIsEditing(true);
	};

	const validateName = (name: string): boolean => {
		const error = validateProjectName(name, projects, projectId);
		setProjectNameError(error);
		return error === '';
	};

	const saveName = () => {
		const trimmedName = projectName.trim();
		if (validateName(trimmedName)) {
			if (trimmedName !== initialName) {
				dispatch(updateProject({ id: projectId, name: trimmedName }));
			}
			setIsEditing(false);
		}
	};

	const handleBlur = () => {
		if (projectNameError === '') {
			saveName();
		} else {
			setProjectName(initialName);
			setProjectNameError('');
			setIsEditing(false);
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setProjectName(newValue);
		validateName(newValue);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			saveName();
		} else if (e.key === 'Escape') {
			setProjectName(initialName);
			setProjectNameError('');
			setIsEditing(false);
		}
	};

	return {
		isEditing,
		projectName,
		projectNameError,
		setProjectName,
		startEditing,
		handleChange,
		handleKeyDown,
		handleBlur,
	};
};
