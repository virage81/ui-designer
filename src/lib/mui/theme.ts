import { createTheme, type ThemeOptions } from '@mui/material/styles';

interface ExtendedThemeOptions extends ThemeOptions {
	colorSchemes?: { light?: ThemeOptions; dark?: ThemeOptions };
}
// todo: разделить после написания тем
export const theme = createTheme({
	colorSchemes: {
		light: {
			palette: { mode: 'light' },
			components: { MuiDialog: { styleOverrides: { paper: { background: '#fff', border: '1px solid #ccc' } } } },
		},
		dark: {
			palette: { mode: 'dark', primary: { main: '#4285F4' }, error: { main: '#FA3F33' }, divider: '#31313A' },
			components: {
				MuiDialog: { styleOverrides: { paper: { background: '#0D0D0DFF', border: '1px solid #31313A' } } },
			},
		},
	},
} as ExtendedThemeOptions);
