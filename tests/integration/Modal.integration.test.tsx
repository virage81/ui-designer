import { type RootState } from '@/store';
import { JestStoreProvider } from '../utils/StoreProvider.tsx';
import { Modal } from '@components/Modal';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import type {Project} from "@shared/types/project.ts";

describe('Modal creates a new project and updates Redux state', () => {
	const renderModal = ({
		open = true,
		preloadedState,
	}: { open?: boolean; preloadedState?: Partial<RootState> } = {}) => {
		return JestStoreProvider(<Modal open={open} toggleModal={jest.fn()} />, { preloadedState });
	};

	test('new project is created and found in store', async () => {
		const { store } = renderModal();

		fireEvent.change(screen.getByLabelText('Название проекта'), { target: { value: 'Title of the project' } });
		fireEvent.change(screen.getByLabelText('Ширина холста (px)'), { target: { value: '500' } });
		fireEvent.change(screen.getByLabelText('Высота холста (px)'), { target: { value: '700' } });
		fireEvent.click(screen.getByRole('button', { name: /Создать/i }));

		await waitFor(()=> {
			const projects: Project[] = store.getState().projects.projects;
			const created: Project | undefined = projects.find((p: Project) => p.name === 'Title of the project');

			expect(created).toBeDefined();
			expect(created?.width).toBe(500);
			expect(created?.height).toBe(700);
		});
	});

	test('the create button is disabled (prevents creation) if store already has a project with the same name', async () => {
		const preloadedState = {
			projects: {
				projects: [{ name: 'Testing', width: 900, height: 600 }],
				history: {},
				layers: {},
				activeLayer: null,
			},
		} as Partial<RootState>;

		const { store } = renderModal({ preloadedState });

		fireEvent.change(screen.getByLabelText('Название проекта'), { target: { value: 'Testing' } });
		fireEvent.change(screen.getByLabelText('Ширина холста (px)'), { target: { value: '500' } });
		fireEvent.change(screen.getByLabelText('Высота холста (px)'), { target: { value: '700' } });
		fireEvent.click(screen.getByRole('button', { name: /Создать/i }));

		const createBtn = screen.getByRole('button', { name: /Создать/i });

		await waitFor(() => expect(createBtn).toBeDisabled());

		await waitFor(() => {
			const projects: Project[] = store.getState().projects.projects;
			expect(projects).toHaveLength(1);
			expect(projects[0].name).toBe('Testing');
		});
	});
});
