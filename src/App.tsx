import { MainPage } from '@pages/MainPage';
import { modifyHistory } from '@store/slices/historySlice';
import { modifyProject } from '@store/slices/projectSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import './App.css';

function App() {
	// @TODO: тестовое изменение
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(modifyProject());
		dispatch(modifyHistory());
	}, []);

	return (
		<>
			<MainPage />
		</>
	);
}

export default App;
