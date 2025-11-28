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
	strokeStyle: string;
	fontSize: number;
}

const initialState: State = {
	tool: ACTIONS.SELECT,
	fillColor: '#3b78e7',
	strokeWidth: 1,
	strokeStyle: '#000',
	fontSize: 16,
};

const toolsSlice = createSlice({
	name: 'Tools',
	initialState,
	reducers: {
		setTool: (state, action: PayloadAction<ACTIONS>) => {
			state.tool = action.payload;
		},
		setFillColor: (state, action: PayloadAction<string>) => {
			state.fillColor = action.payload;
		},
		setStrokeColor: (state, action: PayloadAction<string>) => {
			state.strokeStyle = action.payload;
		},
		setStrokeWidth: (state, action: PayloadAction<number>) => {
			state.strokeWidth = action.payload;
		},
		setFontSize: (state, action: PayloadAction<number>) => {
			state.fontSize = action.payload;
		},
	},
});

export const { setTool, setFillColor, setStrokeColor, setStrokeWidth, setFontSize } = toolsSlice.actions;

export default toolsSlice.reducer;
