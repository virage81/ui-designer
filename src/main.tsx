import { theme } from '@/lib/mui/theme';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { store } from '@store/index';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<App />
			</ThemeProvider>
		</Provider>
	</StrictMode>,
);
