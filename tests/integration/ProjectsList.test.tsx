import { ProjectsList } from '@components/ProjectsList';
import { deleteProject } from '@store/slices/projectsSlice';
import { act, screen } from '@testing-library/react';
import { JestStoreProvider } from '../utils/StoreProvider';
import {ACTIONS} from "@store/slices/toolsSlice.ts";

describe('ProjectsList', () => {
	test('render ProjectCard list when projects array is not empty', () => {
		JestStoreProvider(<ProjectsList />, {
			preloadedState: {
				projects: {
					history: {},
					layers: {},
					zoom: 1,
					guides: { enabled: false, columns: 1, rows: 1 },
					save: {
						lastPreviewSavedAt: Date.now(),
						lastSaveWasManual: false,
					},
					canvasObjects: [],
					activeLayer: null,
					projects: [
						{
							date: new Date().getTime(),
							id: 'project1',
							name: 'Project1',
							height: 800,
							width: 800,
							preview: '',
						},
						{
							date: new Date().getTime(),
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

	test('when a project is deleted, the project list is updated', () => {
		const projectId1 = 'project1';
		const projectId2 = 'project2';
		const layerId1 = 'layer1-project1';
		const layerId2 = 'layer1-project2';

		const { store } = JestStoreProvider(<ProjectsList />, {
			preloadedState: {
				projects: {
					history: {
						[projectId1]: {
							history: [{
								layers: [{ id: layerId1, hidden: false, name: 'Фон', opacity: 100, zIndex: 1 }],
								objects: [],
								type: ACTIONS.BRUSH,
								id: 0,
								date: Date.now(),
								activeLayer: { id: layerId1, hidden: false, name: 'Фон', opacity: 100, zIndex: 1 }
							}],
							pointer: 0,
							active: false
						},
						[projectId2]: {
							history: [{
								layers: [{ id: layerId2, hidden: false, name: 'Фон', opacity: 100, zIndex: 1 }],
								objects: [],
								type: ACTIONS.CIRCLE,
								id: 0,
								date: Date.now(),
								activeLayer: { id: layerId2, hidden: false, name: 'Фон', opacity: 100, zIndex: 1 }
							}],
							pointer: 0,
							active: false
						}
					},
					layers: {
						[projectId1]: [{ id: layerId1, hidden: false, name: 'Фон', opacity: 100, zIndex: 1 }],
						[projectId2]: [{ id: layerId2, hidden: false, name: 'Фон', opacity: 100, zIndex: 1 }]
					},
					activeLayer: {
						id: layerId1,
						name: layerId1,
						opacity: 0,
						zIndex: 2,
						hidden: false
					},
					save: {
						lastPreviewSavedAt: Date.now(),
						lastSaveWasManual: false,
					},
					canvasObjects: [],
					projects: [
						{
							date: Date.now(),
							id: projectId1,
							name: projectId1,
							height: 800,
							width: 800,
							preview: '',
						},
						{
							date: Date.now(),
							id: projectId2,
							name: projectId2,
							height: 800,
							width: 800,
							preview: '',
						},
					],
					zoom: 1,
					guides: { enabled: false, columns: 1, rows: 1 }
				},
			},
		});

		let projectCards = screen.getAllByTestId('project-card');
		expect(projectCards).toHaveLength(2);
		expect(projectCards.length).toBeGreaterThan(0);

		act(() => {
			store.dispatch(deleteProject({ id: projectId1 }));
		});

		projectCards = screen.getAllByTestId('project-card');
		expect(projectCards).toHaveLength(1);
	});
});
