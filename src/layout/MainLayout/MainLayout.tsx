import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary';
import { Loader } from '@components/Loader';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export const MainLayout: React.FC = () => {
	return (
		<ErrorBoundary>
			<Suspense
				fallback={
					<div>
						<Loader />
					</div>
				}>
				<Outlet />
			</Suspense>
		</ErrorBoundary>
	);
};
