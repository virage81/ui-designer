import { createSlice } from "@reduxjs/toolkit";

export const projectHistorySlice = createSlice({
	name: 'History item',
	initialState: '',
	reducers: {
		modifyHistory: () => 'History item'
	}
});
