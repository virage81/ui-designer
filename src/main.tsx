import { theme } from '@/lib/mui/theme';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { persistor, store } from '@store/index';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';
import { PersistGate } from 'redux-persist/integration/react';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<App />
				</ThemeProvider>
			</PersistGate>
		</Provider>
	</StrictMode>,
);
