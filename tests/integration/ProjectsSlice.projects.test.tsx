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

		const spied = jest.spyOn(store, 'dispatch');

		act(() => {
			store.dispatch(createProject({ name, width, height }));
		});
		const { projects, layers, history } = store.getState().projects;
		const projectId = store.getState().projects.projects[0].id;

		expect(projects).toStrictEqual([
			expect.objectContaining({
				id: expect.any(String),
				name,
				date: expect.any(String),
				width,
				height,
			}),
		]);
		expect(layers).toHaveProperty(projectId);
		expect(history).toHaveProperty(projectId);
		expect(spied).toHaveBeenCalledTimes(1);
	});

	test.each([
		['Проект 1', 200, 200],
		['Проект 2', 200, 300],
		['Проект 3', 300, 200],
	])('Редактирование проекта', (name, width, height) => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		act(() => {
			store.dispatch(createProject({ name, width, height }));
		});
		expect(store.getState().projects.projects).toStrictEqual([
			expect.objectContaining({
				id: expect.any(String),
				name,
				date: expect.any(String),
				width,
				height,
			}),
		]);

		act(() => {
			store.dispatch(updateProject({ id: 'mocked-uuid', height: 100, width: 100 }));
		});

		expect(store.getState().projects.projects).toStrictEqual([
			expect.objectContaining({
				id: expect.any(String),
				name,
				date: expect.any(String),
				width: 100,
				height: 100,
			}),
		]);
		expect(spied).toHaveBeenCalledTimes(2);
	});

	test.each([
		['Проект 1', 200, 200],
		['Проект 2', 200, 300],
		['Проект 3', 300, 200],
	])('Удаление проекта', (name, width, height) => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		act(() => {
			store.dispatch(createProject({ name, width, height }));
		});

		expect(store.getState().projects.projects).toStrictEqual([
			expect.objectContaining({
				id: expect.any(String),
				name,
				date: expect.any(String),
				width,
				height,
			}),
		]);

		act(() => {
			store.dispatch(deleteProject({ id: 'mocked-uuid' }));
		});
		expect(store.getState().projects.projects).toStrictEqual([]);
		expect(spied).toHaveBeenCalledTimes(2);
	});
});
