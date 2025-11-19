import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
	name: 'project',
	initialState: '',
	reducers: {
		modifyProject: () => 'Project'
	}
});

export const { modifyProject } = projectSlice.actions

export default projectSlice.reducer
