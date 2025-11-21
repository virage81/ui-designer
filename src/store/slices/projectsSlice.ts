import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Project } from '@shared/interfaces/project.interface.ts';
import { v4 as uuid } from 'uuid';

const initialState: Project[] = [];

const projectsSlice = createSlice({
	name: 'projects',
	initialState: initialState,
	reducers: {
		addProject(state, action: PayloadAction<Omit<Project, 'id' | 'date'>>) {
			state.push({ ...action.payload, id: uuid(), date: new Date().toISOString().split('T')[0] });
		},
	},
});

export const { addProject } = projectsSlice.actions;

export default projectsSlice.reducer;
