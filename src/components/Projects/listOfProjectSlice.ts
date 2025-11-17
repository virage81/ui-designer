import { createSlice } from "@reduxjs/toolkit";

export const listOfProjectSlice = createSlice({
	name: 'list of Projects',
	initialState: '',
	reducers: {
		modifyList: () => 'list of Projects'
	}
});
