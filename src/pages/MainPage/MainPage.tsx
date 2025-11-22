import { MainHeader } from '@components/MainHeader';
import { Modal } from '@components/Modal';
import { ProjectsList } from '@components/ProjectsList';
import { Box } from '@mui/material';
import { useState } from 'react';

export const MainPage: React.FC = () => {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const toggleModal: () => void = () => {
		setOpenModal((prev: boolean) => !prev);
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
			<MainHeader onCreateClick={toggleModal} />
			<Modal open={openModal} toggleModal={toggleModal} />
			<Box component='main' sx={{ flexGrow: 1 }}>
				<ProjectsList />
			</Box>
		</Box>
	);
};
