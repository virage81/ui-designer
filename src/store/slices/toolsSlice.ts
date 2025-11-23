import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export enum ACTIONS {
	SELECT = 'select',
	BRUSH = 'brush',
	RECTANGLE = 'rectangle',
	CIRCLE = 'circle',
	ERASER = 'eraser',
	TEXT = 'text',
	LINE = 'line',
}

interface State {
	tool: ACTIONS;
	fillColor: string;
	strokeWidth: number;
}

const initialState: State = {
	tool: ACTIONS.SELECT,
	fillColor: '#000',
	strokeWidth: 20,
};

const toolsSlice = createSlice({
	name: 'Tools',
	initialState,
	reducers: {
		setTool: (state, action: PayloadAction<ACTIONS>) => {
			state.tool = action.payload;
		},
	},
});

export const { setTool } = toolsSlice.actions;

export default toolsSlice.reducer;
