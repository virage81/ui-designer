import { Modal } from '@/components/Modal';
import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { JestStoreProvider } from '../utils/StoreProvider.tsx';
import type { RootState } from '@/store';

jest.mock('uuid', () => ({ v4: jest.fn(() => 'mocked-uuid-1234') }));

describe('Modal Component', () => {
	const mockToggle = jest.fn();
	const renderModal = ({
		open = true,
		preloadedState = {},
	}: { open?: boolean; preloadedState?: Partial<RootState> } = {}) => {
		const { store, ...utils } = JestStoreProvider(<Modal open={open} toggleModal={mockToggle} />, { preloadedState });
		return { store, ...utils };
	};

	beforeEach(() => {
		mockToggle.mockClear();
	});

	test('renders correctly when opened', (): void => {
		renderModal();

		expect(screen.getByText('Создать новый проект')).toBeInTheDocument();
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('Создать новый проект')).toBeInTheDocument();
		expect(screen.getByLabelText('Название проекта')).toBeInTheDocument();
		expect(screen.getByLabelText('Ширина холста (px)')).toBeInTheDocument();
		expect(screen.getByLabelText('Высота холста (px)')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Отмена/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Создать/i })).toBeInTheDocument();
	});

	test('closes when cancel button or close icon is clicked', () => {
		renderModal({ open: false });

		expect(screen.queryByText('Создать новый проект')).toBeNull();
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(screen.queryByLabelText('Название проекта')).toBeNull();
		expect(screen.queryByLabelText('Ширина холста (px)')).toBeNull();
		expect(screen.queryByLabelText('Высота холста (px)')).toBeNull();
		expect(screen.queryByRole('button', { name: /Отмена/i })).toBeNull();
		expect(screen.queryByRole('button', { name: /Создать/i })).toBeNull();
	});

	test('validates name field – required & pattern', async () => {
		renderModal();

		const nameInput = screen.getByLabelText('Название проекта');

		fireEvent.change(nameInput, { target: { value: '' } });
		await waitFor(() => expect(screen.getByText('Название обязательно')).toBeInTheDocument());

		fireEvent.change(nameInput, { target: { value: '@#$' } });
		await waitFor(() => expect(screen.getByText('Допустимы буквы и цифры')).toBeInTheDocument());

		fireEvent.change(nameInput, { target: { value: 'Проект123' } });
		await waitFor(() => expect(screen.queryByText('Допустимы буквы и цифры')).not.toBeInTheDocument());

		fireEvent.change(nameInput, { target: { value: '0 Проект123' } });
		await waitFor(() => expect(screen.queryByText('Допустимы буквы и цифры')).not.toBeInTheDocument());
	});

	test('validation of width and height - positive integers', async () => {
		renderModal();

		const widthInput = screen.getByLabelText('Ширина холста (px)');
		const heightInput = screen.getByLabelText('Высота холста (px)');

		fireEvent.change(widthInput, { target: { value: 'abc' } });
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
		renderModal();

		const createBtn = screen.getByRole('button', { name: /Создать/i });
		expect(createBtn).toBeEnabled();

		const nameInput = screen.getByLabelText('Название проекта');
		fireEvent.change(nameInput, { target: { value: '' } });

		await waitFor(() => expect(createBtn).toBeDisabled());
	});

	test('closes when the Escape key is pressed', async () => {
		renderModal();
		const dialog = screen.getByRole('dialog');

		fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

		await waitFor(() => {
			expect(mockToggle).toHaveBeenCalledTimes(1);
		});
	});
});
