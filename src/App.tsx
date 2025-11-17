import { useEffect, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { useDispatch } from 'react-redux';
import { listOfProjectSlice } from '@components/Projects/listOfProjectSlice';
import { projectSlice } from '@components/Project/projectSlice';
import { projectHistorySlice } from '@components/History/projectHistorySlice';

function App() {
	const dispatch = useDispatch();
	const [count, setCount] = useState(0);

	useEffect(() => {
		dispatch(projectSlice.actions.modifyProject());
		dispatch(listOfProjectSlice.actions.modifyList());
		dispatch(projectHistorySlice.actions.modifyHistory());
	}, []);

	return (
		<>
			<div>
				<a href='https://vite.dev' target='_blank'>
					<img src={viteLogo} className='logo' alt='Vite logo' />
				</a>
				<a href='https://react.dev' target='_blank'>
					<img src={reactLogo} className='logo react' alt='React logo' />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className='card'>
				<button onClick={() => setCount(count => count + 1)}>count is {count}</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
		</>
	);
}

export default App;
