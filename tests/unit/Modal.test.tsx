import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from '../../src/components/Modal';

describe('Modal Component', () => {
	const mockOnCreate = jest.fn();
	const mockToggle = jest.fn();
	const renderModal: (open?: boolean) => void = (open: boolean = true) => {
		render(<Modal open={open} onCreate={mockOnCreate} toggleModal={mockToggle} />);
	};

	beforeEach(() => {
		mockOnCreate.mockClear();
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
		renderModal(false);

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

	test('calls onCreate with correct params when form is valid', async () => {
		renderModal();

		const nameInput = screen.getByLabelText('Название проекта');
		const widthInput = screen.getByLabelText('Ширина холста (px)');
		const heightInput = screen.getByLabelText('Высота холста (px)');
		const createBtn = screen.getByRole('button', { name: /Создать/i });

		fireEvent.change(nameInput, { target: { value: 'проект 1' } });
		fireEvent.change(widthInput, { target: { value: '127873840' } });
		fireEvent.change(heightInput, { target: { value: '0001111' } });

		await waitFor(() => expect(createBtn).toBeEnabled());

		fireEvent.click(createBtn);

		expect(mockOnCreate).toHaveBeenCalledWith({ name: 'проект 1', width: 127873840, height: 1111 });
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
