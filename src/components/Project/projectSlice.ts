import { createSlice } from "@reduxjs/toolkit";

export const projectSlice = createSlice({
	name: 'Project item',
	initialState: '',
	reducers: {
		modifyProject: () => 'Project item'
	}
});
