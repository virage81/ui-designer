import { createTheme, type Theme } from '@mui/material';

export const theme: Theme = createTheme({ palette: { mode: 'light' } });

export const darkTheme: Theme = createTheme({
	palette: { mode: 'dark', primary: { main: '#4285F4' }, error: { main: '#FA3F33' }, divider: '#31313A' },
	components: { MuiDialog: { styleOverrides: { paper: { background: '#0D0D0DFF', border: '1px solid #31313A' } } } },
});
