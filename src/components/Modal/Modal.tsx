import { type ChangeEvent, type Dispatch, type FC, type SetStateAction, useMemo, useState } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	type Theme,
	ThemeProvider,
	Typography,
	useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { darkTheme, theme as lightTheme } from '@/lib/mui/theme.ts';

interface Modal {
	open: boolean;
	onCreate: (params: { name: string; width: number | string; height: number | string }) => void;
	toggleModal: () => void;
}

export const Modal: FC<Modal> = ({ open = false, onCreate, toggleModal }) => {
	const prefersDarkMode: boolean = useMediaQuery('(prefers-color-scheme: dark)');
	const currentTheme: Theme = useMemo(() => (prefersDarkMode ? darkTheme : lightTheme), [prefersDarkMode]);

	const [name, setName] = useState<string>('Проект');
	const [width, setWidth] = useState<number | string>(800);
	const [height, setHeight] = useState<number | string>(800);

	const [nameError, setNameError] = useState<string>('');
	const [widthError, setWidthError] = useState<string>('');
	const [heightError, setHeightError] = useState<string>('');

	const handleCreate: () => void = (): void => {
		if (!nameError && !widthError && !heightError) {
			onCreate({ name, width, height });
		}
	};

	const validateName: (value: string) => void = (value: string) => {
		const pattern = /^[A-Za-zА-Яа-яЁё0-9\s]+$/;

		if (value.length === 0) {
			setNameError('Название обязательно');
		} else if (!pattern.test(value)) {
			setNameError('Допустимы буквы и цифры');
		} else {
			setNameError('');
		}
		setName(value);
	};

	const validateNumber = (
		value: string,
		setError: Dispatch<SetStateAction<string>>,
		setter: Dispatch<SetStateAction<string | number>>,
	): void => {
		setter(value);
		const num: number = Number(value);
		if (isNaN(num) || num < 1) {
			setError('Введите корректное положительное число');
		} else {
			setError('');
		}
	};

	return (
		<ThemeProvider theme={currentTheme}>
			<Dialog open={open} onClose={(): void => toggleModal()}>
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
							label='Название проекта'
							fullWidth
							margin='normal'
							value={name}
							onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => validateName(e.target.value)}
							error={!!nameError}
							helperText={nameError}
						/>
						<TextField
							label='Ширина холста (px)'
							type='number'
							fullWidth
							margin='normal'
							value={width}
							onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void =>
								validateNumber(e.target.value, setWidthError, setWidth)
							}
							error={!!widthError}
							helperText={widthError}
						/>
						<TextField
							label='Высота холста (px)'
							type='number'
							fullWidth
							margin='normal'
							value={height}
							onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void =>
								validateNumber(e.target.value, setHeightError, setHeight)
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
								borderColor: currentTheme.palette.mode === 'dark' ? '#31313A' : 'rgb(196,196,196)',
								textTransform: 'none',
								color: currentTheme.palette.mode === 'dark' ? '#FFF' : '#000',
								'&:hover':
									currentTheme.palette.mode === 'dark' ? { backgroundColor: '#31313A' } : { borderColor: '#000' },
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
		</ThemeProvider>
	);
};
