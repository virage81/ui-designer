import { createTheme, type Theme } from '@mui/material';

export const theme: Theme = createTheme();

export const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		background: {
			default: '#111216', // темный фон страницы
			paper: '#22242A', // фон модалки
		},
		text: {
			primary: '#F2F2F2', // светлый текст
			secondary: '#B5B7C0', // серый текст описания
		},
		primary: {
			main: '#4285F4', // кнопка "Создать"
		},
		error: {
			main: '#FA3F33', // кнопка "Удалить"
		},
		divider: '#31313A', // линии/обвод
	},
	components: {
		MuiDialog: {
			styleOverrides: {
				paper: { background: '#22242A', borderRadius: 16, boxShadow: '0px 6px 32px rgba(0,0,0,0.35)' },
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					background: '#18191D',
					borderRadius: 8,
					input: { color: '#F2F2F2' },
					'& .MuiOutlinedInput-notchedOutline': { borderColor: '#31313A' },
				},
			},
		},
		MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
	},
});

export default theme;
