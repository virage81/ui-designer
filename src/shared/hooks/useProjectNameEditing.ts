import { useState, type KeyboardEvent } from 'react';
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
	const [originalName, setOriginalName] = useState(initialName);

	const startEditing = () => {
		setOriginalName(initialName);
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
		if (!validateName(projectName)) return;
		if (projectName.trim() !== initialName) {
			dispatch(updateProject({ id: projectId, name: projectName.trim() }));
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

	return {
		isEditing,
		projectName,
		projectNameError,
		setProjectName,
		startEditing,
		validateName,
		handleKeyDown,
		handleBlur,
	};
};
