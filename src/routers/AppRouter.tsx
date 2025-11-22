import { MainLayout } from '@/layout/MainLayout';
import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const MainPage = lazy(() =>
	import('../pages/MainPage/MainPage').then(module => ({
		default: module.MainPage,
	})),
);
const NotFoundPage = lazy(() =>
	import('../pages/NotFoundPage/NotFoundPage').then(module => ({
		default: module.NotFoundPage,
	})),
);
const GraphicEditor = lazy(() =>
	import('../pages/GraphicEditor/GraphicEditor').then(module => ({
		default: module.GraphicEditor,
	})),
);

export const AppRouter: React.FC = () => {
	return (
		<Routes>
			<Route element={<MainLayout />}>
				<Route path='/' element={<MainPage />} />
				<Route path='/projects/:id' element={<GraphicEditor />} />
				<Route path='*' element={<NotFoundPage />} />
			</Route>
		</Routes>
	);
};
