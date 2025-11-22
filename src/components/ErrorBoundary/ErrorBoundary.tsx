import { Box, Button, Card, Typography } from '@mui/material';
import { RefreshCcw } from 'lucide-react';
import React, { type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);

		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		console.error(error.message);

		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error(error, error.message);
		console.error(errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '100vh',
						maxWidth: '100%',
						bgcolor: 'var(--main-bg)',
					}}>
					<Card
						sx={{
							textAlign: 'center',
							p: 5,
							border: '1px solid var(--header-border-color)',
							bgcolor: 'var(--tab-bg)',
						}}>
						<Typography component='h1' variant='h4' fontWeight='bold' sx={{ mb: 4, color: 'var(--color-muted)' }}>
							Упс! Что-то пошло не так.
						</Typography>

						<Button variant='contained' startIcon={<RefreshCcw />} onClick={() => window.location.reload()}>
							Попробовать снова
						</Button>
					</Card>
				</Box>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
