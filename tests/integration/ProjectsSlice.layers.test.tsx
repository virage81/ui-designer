import { createLayer, createProject, deleteLayer, setActiveLayer, updateLayer } from '@store/slices/projectsSlice';
import { act } from '@testing-library/react';
import { JestStoreProvider } from '../utils/StoreProvider';

describe('CRUD операции для ProjectSlice.layers', () => {
	test.each([
		['Проект 1', 200, 200],
		['Проект 2', 200, 300],
		['Проект 3', 300, 200],
	])('Создание слоя', (name, width, height) => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		act(() => {
			store.dispatch(createProject({ name, width, height }));

			store.dispatch(
				createLayer({
					projectId: store.getState().projects.projects[0].id,
					data: { name: 'Layer 1', hidden: false, opacity: 1, zIndex: 1 },
				}),
			);
		});

		const layers = store.getState().projects.layers;
		const projectId = store.getState().projects.projects[0].id;

		expect(spied).toHaveBeenCalledWith(
			expect.objectContaining({
				type: expect.any(String),
				payload: expect.objectContaining({
					projectId: expect.any(String),
					data: {
						name: 'Layer 1',
						hidden: false,
						opacity: 1,
						zIndex: 1,
					},
				}),
			}),
		);
		expect(layers).toHaveProperty(projectId);
		expect(layers[projectId]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: expect.any(String),
					name: 'Layer 1',
					hidden: false,
					opacity: 1,
					zIndex: 1,
				}),
			]),
		);
		expect(spied).toHaveBeenCalledTimes(2);
	});

	test('Создание слоя без проекта', () => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		const projectId = 'unexisting-project-id';

		act(() => {
			expect(() =>
				store.dispatch(
					createLayer({
						projectId,
						data: { name: 'Layer 1', hidden: false, opacity: 1, zIndex: 1 },
					}),
				),
			).toThrow();
		});

		const layers = store.getState().projects.layers;

		expect(layers).not.toHaveProperty(projectId);
		expect(spied).toHaveBeenCalledTimes(1);
	});

	test.each([
		['Проект 1', 200, 200],
		['Проект 2', 200, 300],
		['Проект 3', 300, 200],
	])('Редактирование слоя', (name, width, height) => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		act(() => {
			store.dispatch(createProject({ name, width, height }));
		});
		const projectId = store.getState().projects.projects[0].id;

		act(() => {
			store.dispatch(
				updateLayer({
					projectId,
					data: {
						id: store.getState().projects.layers[projectId][0].id,
						zIndex: 3,
						opacity: 65,
					},
				}),
			);
		});

		const layers = store.getState().projects.layers;

		expect(spied).toHaveBeenCalledWith(
			expect.objectContaining({
				type: expect.any(String),
				payload: expect.objectContaining({
					projectId: expect.any(String),
					data: {
						id: store.getState().projects.layers[projectId][0].id,
						zIndex: 3,
						opacity: 65,
					},
				}),
			}),
		);
		expect(layers).toHaveProperty(projectId);
		expect(layers[projectId]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: expect.any(String),
					name: 'Фон',
					hidden: false,
					opacity: 65,
					zIndex: 3,
				}),
			]),
		);
		expect(spied).toHaveBeenCalledTimes(2);
	});

	test('Редактирование слоя без проекта', () => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		const projectId = 'unexisting-project-id';

		act(() => {
			expect(() =>
				store.dispatch(
					updateLayer({
						projectId,
						data: { id: projectId, name: 'Layer 1', hidden: false, opacity: 1, zIndex: 1 },
					}),
				),
			).toThrow();
		});

		const layers = store.getState().projects.layers;

		expect(layers).not.toHaveProperty(projectId);
		expect(spied).toHaveBeenCalledTimes(1);
	});

	test.each([
		['Проект 1', 200, 200],
		['Проект 2', 200, 300],
		['Проект 3', 300, 200],
	])('Удаление слоя', (name, width, height) => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		act(() => {
			store.dispatch(createProject({ name, width, height }));
		});
		const projectId = store.getState().projects.projects[0].id;

		act(() => {
			store.dispatch(
				createLayer({
					projectId,
					data: {
						name: 'Layer 1',
						hidden: false,
						opacity: 100,
						zIndex: 2,
					},
				}),
			);
			store.dispatch(
				deleteLayer({
					projectId,
					id: store.getState().projects.layers[projectId][1].id,
				}),
			);
		});

		const layers = store.getState().projects.layers;

		expect(spied).toHaveBeenCalledWith(
			expect.objectContaining({
				type: expect.any(String),
				payload: expect.objectContaining({
					projectId: expect.any(String),
					id: expect.any(String),
				}),
			}),
		);
		expect(layers).toHaveProperty(projectId);
		expect(layers[projectId]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: expect.any(String),
					name: expect.any(String),
					hidden: false,
					opacity: 100,
					zIndex: 1,
				}),
			]),
		);
		expect(spied).toHaveBeenCalledTimes(3);
	});

	test('Удаление слоя без проекта', () => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		const projectId = 'unexisting-project-id';

		act(() => {
			expect(() =>
				store.dispatch(
					deleteLayer({
						projectId,
						id: projectId,
					}),
				),
			).toThrow();
		});

		const layers = store.getState().projects.layers;

		expect(layers).not.toHaveProperty(projectId);
		expect(spied).toHaveBeenCalledTimes(1);
	});

	test('Выбор активного слоя', () => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		act(() => {
			store.dispatch(createProject({ name: 'test', width: 200, height: 200 }));

			store.dispatch(
				createLayer({
					projectId: store.getState().projects.projects[0].id,
					data: { name: 'Layer 1', hidden: false, opacity: 1, zIndex: 1 },
				}),
			);
		});

		const layers = store.getState().projects.layers;
		const projectId = store.getState().projects.projects[0].id;

		expect(spied).toHaveBeenCalledWith(
			expect.objectContaining({
				type: expect.any(String),
				payload: expect.objectContaining({
					projectId: expect.any(String),
					data: {
						name: 'Layer 1',
						hidden: false,
						opacity: 1,
						zIndex: 1,
					},
				}),
			}),
		);
		expect(layers).toHaveProperty(projectId);
		expect(layers[projectId]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: expect.any(String),
					name: expect.any(String),
					hidden: false,
					opacity: 100,
					zIndex: 1,
				}),
				expect.objectContaining({
					id: expect.any(String),
					name: expect.any(String),
					hidden: false,
					opacity: 1,
					zIndex: 1,
				}),
			]),
		);

		act(() => {
			store.dispatch(setActiveLayer({ projectId, id: layers[projectId][1].id }));
		});

		const { activeLayer } = store.getState().projects;

		expect(spied).toHaveBeenCalledWith(
			expect.objectContaining({
				type: expect.any(String),
				payload: expect.objectContaining({
					projectId: expect.any(String),
					id: expect.any(String),
				}),
			}),
		);
		expect(activeLayer).toEqual(
			expect.objectContaining({
				id: expect.any(String),
				name: expect.any(String),
				hidden: false,
				opacity: 1,
				zIndex: 1,
			}),
		);

		expect(spied).toHaveBeenCalledTimes(3);
	});

	test('Выбор активного слоя для несуществующего проекта', () => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		const layerId = 'mock-layer-id';
		const projectId = 'mock-project-id';

		act(() => {
			expect(() => store.dispatch(setActiveLayer({ projectId, id: layerId }))).toThrow();
		});

		const { activeLayer } = store.getState().projects;

		expect(spied).toHaveBeenCalledWith(
			expect.objectContaining({
				type: expect.any(String),
				payload: expect.objectContaining({
					projectId,
					id: layerId,
				}),
			}),
		);
		expect(activeLayer).toEqual(null);
		expect(spied).toHaveBeenCalledTimes(1);
	});

	test('Выбор активного слоя с неверным id', () => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		const layerId = 'mock-layer-id';

		act(() => {
			store.dispatch(createProject({ name: 'test', width: 200, height: 200 }));
		});

		const projectId = store.getState().projects.projects[0].id;

		expect(store.getState().projects.layers).toHaveProperty(projectId);

		act(() => {
			expect(() => store.dispatch(setActiveLayer({ projectId, id: layerId }))).toThrow();
		});

		const { activeLayer } = store.getState().projects;

		expect(spied).toHaveBeenCalledWith(
			expect.objectContaining({
				type: expect.any(String),
				payload: expect.objectContaining({
					projectId: expect.any(String),
					id: layerId,
				}),
			}),
		);
		expect(activeLayer).toEqual(
			expect.objectContaining({
				id: expect.any(String),
				name: expect.any(String),
				hidden: false,
				opacity: 100,
				zIndex: 1,
			}),
		);
		expect(spied).toHaveBeenCalledTimes(2);
	});

	test('Удаление активного слоя', () => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		act(() => {
			store.dispatch(createProject({ name: 'test', width: 200, height: 200 }));

			store.dispatch(
				createLayer({
					projectId: store.getState().projects.projects[0].id,
					data: { name: 'Layer 1', hidden: false, opacity: 1, zIndex: 1 },
				}),
			);
		});

		const layers = store.getState().projects.layers;
		const projectId = store.getState().projects.projects[0].id;

		expect(spied).toHaveBeenCalledWith(
			expect.objectContaining({
				type: expect.any(String),
				payload: expect.objectContaining({
					projectId: expect.any(String),
					data: {
						name: 'Layer 1',
						hidden: false,
						opacity: 1,
						zIndex: 1,
					},
				}),
			}),
		);
		expect(layers).toHaveProperty(projectId);
		expect(layers[projectId]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: expect.any(String),
					name: expect.any(String),
					hidden: false,
					opacity: 1,
					zIndex: 1,
				}),
			]),
		);

		act(() => {
			store.dispatch(setActiveLayer({ projectId, id: layers[projectId][1].id }));
		});

		const { activeLayer } = store.getState().projects;

		expect(spied).toHaveBeenCalledWith(
			expect.objectContaining({
				type: expect.any(String),
				payload: expect.objectContaining({
					projectId: expect.any(String),
					id: expect.any(String),
				}),
			}),
		);
		expect(activeLayer).toEqual(
			expect.objectContaining({
				id: expect.any(String),
				name: 'Layer 1',
				hidden: false,
				opacity: 1,
				zIndex: 1,
			}),
		);

		act(() => {
			store.dispatch(setActiveLayer(null));
		});

		expect(store.getState().projects.activeLayer).toEqual(null);
		expect(spied).toHaveBeenCalledTimes(4);
	});

	test('Удаление последнего слоя', () => {
		const { store } = JestStoreProvider(<div />);

		const spied = jest.spyOn(store, 'dispatch');

		act(() => {
			store.dispatch(createProject({ name: 'test', width: 200, height: 200 }));
		});

		const layers = store.getState().projects.layers;
		const projectId = store.getState().projects.projects[0].id;

		act(() => {
			expect(() =>
				store.dispatch(
					deleteLayer({
						projectId: store.getState().projects.projects[0].id,
						id: layers[projectId][0].id,
					}),
				),
			).toThrow();
		});

		expect(layers).toHaveProperty(projectId);
		expect(layers[projectId]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: expect.any(String),
					name: expect.any(String),
					hidden: expect.any(Boolean),
					opacity: expect.any(Number),
					zIndex: expect.any(Number),
				}),
			]),
		);

		expect(spied).toHaveBeenCalledTimes(2);
	});
});
