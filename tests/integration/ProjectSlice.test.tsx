import App from '@/App';
import { createProject, deleteProject, updateProject } from '@store/slices/projectsSlice';
import { JestStoreProvider } from '../utils/StoreProvider';

describe('CRUD операции для ProjectSlice', () => {
	test.each([
		['Проект 1', new Date().toISOString(), 200, 200],
		['Проект 2', new Date().toISOString(), 200, 300],
		['Проект 3', new Date().toISOString(), 300, 200],
	])('Создание проекта', (name, date, width, height) => {
		const { store } = JestStoreProvider(<App />);

		const spied = jest.spyOn(store, 'dispatch');

		store.dispatch(createProject({ name, date, width, height }));

		expect(store.getState().projects.projects).toStrictEqual([
			expect.objectContaining({
				id: expect.any(String),
				name,
				date: expect.any(String),
				width,
				height,
			}),
		]);
		expect(spied).toHaveBeenCalledTimes(1);
	});

	test.each([
		['Проект 1', new Date().toISOString(), 200, 200],
		['Проект 2', new Date().toISOString(), 200, 300],
		['Проект 3', new Date().toISOString(), 300, 200],
	])('Редактирование проекта', (name, date, width, height) => {
		const { store } = JestStoreProvider(<App />);

		const spied = jest.spyOn(store, 'dispatch');

		store.dispatch(createProject({ name, date, width, height }));

		expect(store.getState().projects.projects).toStrictEqual([
			expect.objectContaining({
				id: expect.any(String),
				name,
				date: expect.any(String),
				width,
				height,
			}),
		]);

		store.dispatch(updateProject({ id: 'mocked-uuid', height: 100, width: 100 }));

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
		['Проект 1', new Date().toISOString(), 200, 200],
		['Проект 2', new Date().toISOString(), 200, 300],
		['Проект 3', new Date().toISOString(), 300, 200],
	])('Удаление проекта', (name, date, width, height) => {
		const { store } = JestStoreProvider(<App />);

		const spied = jest.spyOn(store, 'dispatch');

		store.dispatch(createProject({ name, date, width, height }));

		expect(store.getState().projects.projects).toStrictEqual([
			expect.objectContaining({
				id: expect.any(String),
				name,
				date: expect.any(String),
				width,
				height,
			}),
		]);

		store.dispatch(deleteProject({ id: 'mocked-uuid' }));

		expect(store.getState().projects.projects).toStrictEqual([]);
		expect(spied).toHaveBeenCalledTimes(2);
	});
});
