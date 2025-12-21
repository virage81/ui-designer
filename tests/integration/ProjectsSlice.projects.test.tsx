import { createProject, deleteProject, updateProject } from '@store/slices/projectsSlice';
import { act } from '@testing-library/react';
import { JestStoreProvider } from '../utils/StoreProvider';

describe('CRUD операции для ProjectSlice.projects', () => {
	test.each([
		['Проект 1', 200, 200],
		['Проект 2', 200, 300],
		['Проект 3', 300, 200],
	])('Создание проекта', (name, width, height) => {
		const { store } = JestStoreProvider(<div />);

		act(() => {
			store.dispatch(createProject({ name, width, height }));
		});

		const projects = store.getState().projects.projects;
		const projectId = projects[0].id;
		const { layers, history } = store.getState().projects;

		expect(projects).toHaveLength(1);
		expect(projects[0]).toMatchObject({
			name,
			width,
			height,
		});
		expect(projects[0]).toHaveProperty('id');
		expect(projects[0]).toHaveProperty('date');
		expect(projects[0]).toHaveProperty('preview');

		expect(layers).toHaveProperty(projectId);
		expect(history).toHaveProperty(projectId);
	});

	test.each([
		['Проект 1', 200, 200],
		['Проект 2', 200, 300],
		['Проект 3', 300, 200],
	])('Редактирование проекта', (name, width, height) => {
		const { store } = JestStoreProvider(<div />);

		act(() => {
			store.dispatch(createProject({ name, width, height }));
		});

		const projectId = store.getState().projects.projects[0].id;

		act(() => {
			store.dispatch(updateProject({ id: projectId, height: 100, width: 100 }));
		});

		const updatedProject = store.getState().projects.projects[0];

		expect(updatedProject).toMatchObject({
			id: projectId,
			name,
			width: 100,
			height: 100,
		});
		expect(updatedProject).toHaveProperty('date');
		expect(updatedProject).toHaveProperty('preview');
	});

	test.each([
		['Проект 1', 200, 200],
		['Проект 2', 200, 300],
		['Проект 3', 300, 200],
	])('Удаление проекта', (name, width, height) => {
		const { store } = JestStoreProvider(<div />);

		act(() => {
			store.dispatch(createProject({ name, width, height }));
		});

		const projectId = store.getState().projects.projects[0].id;

		act(() => {
			store.dispatch(deleteProject({ id: projectId }));
		});

		expect(store.getState().projects.projects).toHaveLength(0);
	});
});
