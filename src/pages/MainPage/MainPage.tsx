import { MainHeader } from '@components/MainHeader';
import { Modal } from '@components/Modal';
import { useState } from 'react';
export const MainPage: React.FC = () => {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const toggleModal: () => void = () => {
		setOpenModal(!openModal);
	};
	return (
		<div>
			<MainHeader onCreateClick={toggleModal} />
			<Modal open={openModal} onCreate={(): void => {}} toggleModal={toggleModal} />
			{/* TODO: Ниже расположить контент главной страницы */}
			<main>MainPage</main>
		</div>
	);
};
