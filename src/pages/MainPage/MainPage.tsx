import { DeleteConfirmModal } from '@components/DeleteConfirmModal';
import { MainHeader } from '@components/MainHeader';
import { ProjectsList } from '@components/ProjectsList';
import { Box } from '@mui/material';
import { useState } from 'react';

export const MainPage: React.FC = () => {
	const [openDeleteConfirmModal, setOpenDeleteConfirmModal] = useState(false); //TODO удалить, когда появится StateManager
	const [projectName, setProjectName] = useState(''); //TODO удалить, когда появится StateManager

	const handleOpenDeleteConfirmModal = (title: string) => {
		setOpenDeleteConfirmModal(true);
		setProjectName(title);
	}; //TODO удалить, когда появится StateManager
	const handleCloseDeleteConfirmModal = () => setOpenDeleteConfirmModal(false); //TODO удалить, когда появится StateManager

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100vh',
			}}>
			<MainHeader />
			<Box
				component='main'
				sx={{
					flexGrow: 1,
				}}>
				<ProjectsList handleOpenDeleteConfirmModal={handleOpenDeleteConfirmModal} />
			</Box>
			<DeleteConfirmModal
				open={openDeleteConfirmModal}
				handleClose={handleCloseDeleteConfirmModal}
				projectName={projectName}
			/>
		</Box>
	);
};
