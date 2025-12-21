import { Modal } from '@/components/Modal';
import { closeCreateProjectModal, openCreateProjectModal } from '@store/slices/modalsSlice';
import '@testing-library/jest-dom';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { JestStoreProvider } from '../utils/StoreProvider.tsx';

describe('Modal Component', () => {
	let store: ReturnType<typeof JestStoreProvider>['store'];

	const renderModal = () => {
		const modal = JestStoreProvider(<Modal />);
		store = modal.store;
		return modal;
	};

	beforeEach(() => {
		renderModal();
	});

	test('renders correctly when opened', (): void => {
		act(() => store.dispatch(openCreateProjectModal()));

		expect(screen.getByText('Создать новый проект')).toBeInTheDocument();
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByLabelText('Название проекта')).toBeInTheDocument();
		expect(screen.getByLabelText('Ширина холста (px)')).toBeInTheDocument();
		expect(screen.getByLabelText('Высота холста (px)')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Отмена/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Создать/i })).toBeInTheDocument();
	});

	test('does not render when closed', () => {
		act(() => store.dispatch(closeCreateProjectModal()));

		expect(screen.queryByRole('dialog')).toBeNull();
		expect(screen.queryByText('Создать новый проект')).toBeNull();
	});

	test('validates name field – required & pattern', async () => {
		act(() => store.dispatch(openCreateProjectModal()));

		const nameInput = screen.getByLabelText('Название проекта');

		fireEvent.change(nameInput, { target: { value: '' } });
		await waitFor(() => expect(screen.getByText('Название обязательно')).toBeInTheDocument());

		fireEvent.change(nameInput, { target: { value: '@#$' } });
		await waitFor(() => expect(screen.getByText('Допустимы буквы и цифры')).toBeInTheDocument());

		fireEvent.change(nameInput, { target: { value: 'Проект123' } });
		await waitFor(() => expect(screen.queryByText('Допустимы буквы и цифры')).not.toBeInTheDocument());
	});

	test('validation of width and height - positive integers', async () => {
		act(() => store.dispatch(openCreateProjectModal()));

		const widthInput = screen.getByLabelText('Ширина холста (px)');
		const heightInput = screen.getByLabelText('Высота холста (px)');

		fireEvent.change(widthInput, { target: { value: '-123' } });
		fireEvent.change(heightInput, { target: { value: '-5' } });

		await waitFor(() => {
			expect(screen.getAllByText('Введите целое положительное число')).toHaveLength(2);
		});

		fireEvent.change(widthInput, { target: { value: '1024' } });
		fireEvent.change(heightInput, { target: { value: '768' } });

		await waitFor(() => {
			expect(screen.queryByText('Введите целое положительное число')).not.toBeInTheDocument();
		});
	});

	test('the create button is disabled when any validation error exists', async () => {
		act(() => store.dispatch(openCreateProjectModal()));

		const createBtn = screen.getByRole('button', { name: /Создать/i });
		expect(createBtn).toBeEnabled();

		const nameInput = screen.getByLabelText('Название проекта');
		fireEvent.change(nameInput, { target: { value: '' } });

		await waitFor(() => expect(createBtn).toBeDisabled());
	});

	test('closes when the Escape key is pressed', async () => {
		act(() => store.dispatch(openCreateProjectModal()));

		const dialog = screen.getByRole('dialog');

		fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

		await waitFor(() => {
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	test('closes when cancel button is clicked', async () => {
		act(() => store.dispatch(openCreateProjectModal()));

		const cancelBtn = screen.getByRole('button', { name: /Отмена/i });

		fireEvent.click(cancelBtn);

		await waitFor(() => {
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	test('closes when close icon is clicked', async () => {
		act(() => store.dispatch(openCreateProjectModal()));

		const closeIcon = screen.getByLabelText('close');

		fireEvent.click(closeIcon);

		await waitFor(() => {
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});
});
