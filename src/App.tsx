import { MainPage } from '@pages/MainPage';
import './App.css';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { modifyHistory } from '@store/history';
import { modifyProjects } from '@store/projects';
import { modifyProject } from '@store/project';

function App() {
	// @TODO: тестовое изменение
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(modifyProject());
		dispatch(modifyProjects());
		dispatch(modifyHistory());
	}, []);
	//

	return (
		<>
			<MainPage />
		</>
	);
}

export default App;
