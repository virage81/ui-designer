import { createSlice } from "@reduxjs/toolkit";

const historySlice = createSlice({
	name: 'history',
	initialState: '',
	reducers: {
		modifyHistory: () => 'History'
	}
});

export const { modifyHistory } = historySlice.actions

export default historySlice.reducer
