import { createSlice } from "@reduxjs/toolkit";

const projectsSlice = createSlice({
	name: 'projects',
	initialState: '',
	reducers: {
		modifyProjects: () => 'Projects'
	}
});

export const { modifyProjects } = projectsSlice.actions

export default projectsSlice.reducer
