import { type RootState } from '@/store';
import { Modal } from '@components/Modal';
import type { Project } from '@shared/types/project';
import { openCreateProjectModal } from '@store/slices/modalsSlice';
import '@testing-library/jest-dom';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { JestStoreProvider } from '../utils/StoreProvider.tsx';

describe('Modal Component - Integration', () => {
	const renderModal = ({ preloadedState }: { preloadedState?: Partial<RootState> } = {}) => {
		return JestStoreProvider(<Modal />, { preloadedState });
	};

	test('creates new project and updates Redux store', async () => {
		const { store } = renderModal();
		act(() => store.dispatch(openCreateProjectModal()));

		fireEvent.change(screen.getByLabelText('Название проекта'), { target: { value: 'Test Project' } });
		fireEvent.change(screen.getByLabelText('Ширина холста (px)'), { target: { value: '500' } });
		fireEvent.change(screen.getByLabelText('Высота холста (px)'), { target: { value: '700' } });

		fireEvent.click(screen.getByRole('button', { name: /Создать/i }));

		await waitFor(() => {
			const projects: Project[] = store.getState().projects.projects;
			const created = projects.find(p => p.name === 'Test Project');

			expect(created).toBeDefined();
			expect(created?.width).toBe(500);
			expect(created?.height).toBe(700);
		});
	});

	test('prevents duplicate project creation with same name', async () => {
		const preloadedState = {
			projects: {
				projects: [{ name: 'Testing', width: 900, height: 600 }],
				history: {},
				layers: {},
				activeLayer: null,
			},
		} as Partial<RootState>;

		const { store } = renderModal({ preloadedState });
		act(() => store.dispatch(openCreateProjectModal()));

		fireEvent.change(screen.getByLabelText('Название проекта'), { target: { value: 'Testing' } });
		fireEvent.change(screen.getByLabelText('Ширина холста (px)'), { target: { value: '500' } });
		fireEvent.change(screen.getByLabelText('Высота холста (px)'), { target: { value: '700' } });

		const createBtn = screen.getByRole('button', { name: /Создать/i });
		fireEvent.click(createBtn);

		await waitFor(() => {
			expect(screen.getByText('Проект с таким именем уже существует')).toBeInTheDocument();
			expect(createBtn).toBeDisabled();
		});

		const projects: Project[] = store.getState().projects.projects;
		expect(projects).toHaveLength(1);
		expect(projects[0].name).toBe('Testing');
	});
});
