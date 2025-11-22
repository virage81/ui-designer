import { createTheme, type ThemeOptions } from '@mui/material/styles';
declare module '@mui/material/Button' {
	interface ButtonPropsVariantOverrides {
		'graphic-tools': true;
		tools: true;
		canceled: true;
	}
}

interface ExtendedThemeOptions extends ThemeOptions {
	colorSchemes?: { light?: ThemeOptions; dark?: ThemeOptions };
}

const shared: ThemeOptions = {
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: 'var(--header-bg)',
					borderBottom: '1px solid',
					borderColor: 'var(--header-border-color)',
					color: 'var(--color)',
					boxShadow: 'none',
				},
			},
		},
		MuiDialog: {
			styleOverrides: {
				paper: { background: 'var(--main-bg)', color: 'var(--color)', border: '1px solid var(--header-border-color)' },
			},
		},
		MuiButton: {
			variants: [
				{
					props: { variant: 'canceled' },
					style: {
						minWidth: 'auto',
						border: '1px solid var(--tab-bg)',
						color: 'var(--color)',
						textTransform: 'none',
						':hover': { backgroundColor: 'var(--hover-bg)', color: 'var(--hover-color)' },
					},
				},
				{
					props: { variant: 'tools' },
					style: {
						minWidth: 'auto',
						color: 'var(--color)',
						padding: '3px 10px',
						textTransform: 'none',
						':hover': { backgroundColor: 'var(--hover-bg)', color: 'var(--hover-color)' },
					},
				},
				{
					props: { variant: 'graphic-tools' },
					style: {
						width: '48px',
						height: '48px',
						minWidth: '48px',
						minHeight: '48px',
						color: 'var(--color)',
						padding: '0',
						textTransform: 'none',
						':hover': { backgroundColor: 'var(--hover-bg)', color: 'var(--hover-color)' },
						':focus': { backgroundColor: 'var(--color-primary)', color: 'var(--hover-color)' },
					},
				},
			],
		},
		MuiTabs: {
			styleOverrides: {
				root: {
					minHeight: 'auto',
					width: '100%',
					backgroundColor: 'var(--header-bg)',
					padding: '0.5rem',
				},
				list: {
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					padding: '0.25rem',
					border: '1px solid var(--header-border-color)',
					borderRadius: '4px',
					color: 'var(--color)',
					backgroundColor: 'var(--tabs-container-bg)',
				},
				indicator: {
					display: 'none',
				},
			},
		},
		MuiTab: {
			defaultProps: {
				disableRipple: true,
			},
			styleOverrides: {
				root: {
					display: 'flex',
					flexGrow: 1,
					textTransform: 'none',
					fontSize: '0.875rem',
					maxHeight: '29px',
					minHeight: '29px',
					borderRadius: '4px',
					padding: 0,
					color: 'var(--color)',
					backgroundColor: 'var(--tab-bg)',

					'&.Mui-selected': {
						color: 'var(--tab-color)',
						backgroundColor: 'var(--active-tab-bg)',
					},
				},
			},
		},
	},
};

export const theme = createTheme({
	...shared,
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
