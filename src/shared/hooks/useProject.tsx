import type { RootState } from '@store/index';
import { selectProjectById } from '@store/slices/projectsSlice';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

export const useProject = () => {
	const { id = '' } = useParams();
	const project = useSelector((state: RootState) => selectProjectById(state, id));

	if (!project) throw new Error(`Project ${id} not found`);

	return project;
};
