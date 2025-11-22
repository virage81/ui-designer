import { ProjectsList } from '@components/ProjectsList';
import { deleteProject } from '@store/slices/projectsSlice';
import { act, screen } from '@testing-library/react';
import { JestStoreProvider } from '../utils/StoreProvider';

describe('ProjectsList', () => {
	test('render ProjectCard list when projects array is not empty', () => {
		JestStoreProvider(<ProjectsList />, {
			preloadedState: {
				projects: {
					history: {},
					layers: {},
					activeLayer: null,
					projects: [
						{
							date: new Date().toISOString(),
							id: 'project1',
							name: 'Project1',
							height: 800,
							width: 800,
							preview: '',
						},
						{
							date: new Date().toISOString(),
							id: 'project2',
							name: 'Project2',
							height: 800,
							width: 800,
							preview: '',
						},
					],
				},
			},
		});

		const projectCards = screen.getAllByTestId('project-card');

		expect(() => screen.getByTestId('empty-state')).toThrow();
		expect(projectCards).toHaveLength(2);
		expect(projectCards.length).toBeGreaterThan(0);
	});

	test('render EmptyProjectsState when projects array is empty', () => {
		const { store } = JestStoreProvider(<ProjectsList />);
		const { projects } = store.getState().projects;

		expect(() => screen.getAllByTestId('project-card')).toThrow();

		const emptyProjectsState = screen.getByTestId('empty-state');

		expect(emptyProjectsState).toBeInTheDocument();
		expect(projects).toHaveLength(0);
	});

	test.todo('when a project is deleted, the project list is updated');
});
