import { type ChangeEvent, type FC, useEffect, useState } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Modal {
	open: boolean;
	onCreate: (params: { name: string; width: number; height: number }) => void;
	toggleModal: () => void;
}

export const Modal: FC<Modal> = ({ open = false, onCreate, toggleModal }) => {
	const DEFAULT_NAME = 'Проект';
	const DEFAULT_SIZE = 800;

	const [name, setName] = useState<string>(DEFAULT_NAME);
	const [width, setWidth] = useState<number | string>(DEFAULT_SIZE);
	const [height, setHeight] = useState<number | string>(DEFAULT_SIZE);

	const [nameError, setNameError] = useState<string>('');
	const [widthError, setWidthError] = useState<string>('');
	const [heightError, setHeightError] = useState<string>('');

	const resetForm: () => void = (): void => {
		setName(DEFAULT_NAME);
		setWidth(DEFAULT_SIZE);
		setHeight(DEFAULT_SIZE);
		setNameError('');
		setWidthError('');
		setHeightError('');
	};

	useEffect(() => {
		if (open) {
			const id = setTimeout(resetForm, 0);
			return (): void => clearTimeout(id);
		}
	}, [open]);

	const handleCreate: () => void = (): void => {
		if (!nameError && !widthError && !heightError) {
			onCreate({ name: name.trim(), width: Number(width), height: Number(height) });
		}
	};

	const validateInput = (value: string, field: string): void => {
		const pattern = /^[A-Za-zА-Яа-яЁё0-9\s]+$/;

		switch (field) {
			case 'projectName': {
				if (value.length === 0) {
					setNameError('Название обязательно');
				} else if (!pattern.test(value)) {
					setNameError('Допустимы буквы и цифры');
				} else {
					setNameError('');
				}
				setName(value);
				break;
			}
			case 'width': {
				const num: number = Number(value);
				setWidth(value);
				if (!Number.isInteger(num) || num < 1) {
					setWidthError('Введите целое положительное число');
				} else {
					setWidthError('');
				}
				break;
			}
			case 'height': {
				const num: number = Number(value);
				setHeight(value);
				if (!Number.isInteger(num) || num < 1) {
					setHeightError('Введите целое положительное число');
				} else {
					setHeightError('');
				}
				break;
			}
			default:
				break;
		}
	};

	return (
		<Dialog open={open} onClose={toggleModal} disableRestoreFocus>
			<Box sx={{ position: 'relative', paddingBottom: 2 }}>
				<DialogTitle aria-labelledby='modal-title' sx={{ position: 'relative' }}>
					Создать новый проект
					<IconButton
						aria-label='close'
						onClick={(): void => toggleModal()}
						sx={{
							position: 'absolute',
							right: 10,
							top: 8,
							color: 'grey.500',
							backgroundColor: 'transparent',
							'&:hover': { backgroundColor: 'transparent', filter: 'brightness(1.3)' },
						}}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Typography sx={{ color: '#9fa5b5', marginBottom: 2 }}>Укажите параметры для нового проекта</Typography>
					<TextField
						name='projectName'
						label='Название проекта'
						fullWidth
						margin='normal'
						value={name}
						onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
							validateInput(e.target.value, e.target.name)
						}
						error={!!nameError}
						helperText={nameError}
					/>
					<TextField
						name='width'
						label='Ширина холста (px)'
						type='number'
						fullWidth
						margin='normal'
						value={width}
						slotProps={{ htmlInput: { min: 0 } }}
						onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
							validateInput(e.target.value, e.target.name)
						}
						error={!!widthError}
						helperText={widthError}
					/>
					<TextField
						name='height'
						label='Высота холста (px)'
						type='number'
						fullWidth
						margin='normal'
						value={height}
						slotProps={{ htmlInput: { min: 0 } }}
						onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
							validateInput(e.target.value, e.target.name)
						}
						error={!!heightError}
						helperText={heightError}
					/>
				</DialogContent>
				<DialogActions sx={{ paddingRight: '24px', paddingLeft: '24px' }}>
					<Button
						onClick={(): void => toggleModal()}
						variant='outlined'
						sx={{
							borderColor: theme => (theme.palette.mode === 'dark' ? '#31313A' : 'rgb(196,196,196)'),
							textTransform: 'none',
							color: theme => (theme.palette.mode === 'dark' ? '#FFF' : '#000'),
							'&:hover': {
								backgroundColor: theme => (theme.palette.mode === 'dark' ? '#31313A' : null),
								borderColor: theme => (theme.palette.mode !== 'dark' ? '#000' : null),
							},
						}}>
						Отмена
					</Button>
					<Button
						onClick={handleCreate}
						variant='contained'
						disabled={!!nameError || !!widthError || !!heightError}
						sx={{ textTransform: 'none' }}>
						Создать
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	);
};
