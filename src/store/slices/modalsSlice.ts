import { createSlice } from '@reduxjs/toolkit';

interface ModalsSliceState {
	isCreateProjectModalOpen: boolean;
}

const initialState: ModalsSliceState = { isCreateProjectModalOpen: false };

const modalsSlice = createSlice({
	name: 'modals',
	initialState,
	reducers: {
		openCreateProjectModal: state => {
			state.isCreateProjectModalOpen = true;
		},
		closeCreateProjectModal: state => {
			state.isCreateProjectModalOpen = false;
		},
		toggleCreateProjectModal: state => {
			state.isCreateProjectModalOpen = !state.isCreateProjectModalOpen;
		},
	},
});

export const { openCreateProjectModal, closeCreateProjectModal, toggleCreateProjectModal } = modalsSlice.actions;
export default modalsSlice.reducer;
