import { createSlice } from '@reduxjs/toolkit';

interface ModalsSliceState {
	isCreateProjectModalOpen: boolean;
}

const initialState: ModalsSliceState = {
	isCreateProjectModalOpen: false,
};

const modalsSlice = createSlice({
	name: 'modals',
	initialState,
	reducers: {
		toggleCreateProjectModal: (state) => {
			state.isCreateProjectModalOpen = !state.isCreateProjectModalOpen;
		},
	},
});

export const { toggleCreateProjectModal } = modalsSlice.actions;
export default modalsSlice.reducer;
