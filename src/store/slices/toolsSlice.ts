import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export enum ACTIONS {
	SELECT = 'select',
	BRUSH = 'brush',
	RECTANGLE = 'rectangle',
	CIRCLE = 'circle',
	ERASER = 'eraser',
	TEXT = 'text',
	LINE = 'line',
	FONT = 'font',
	LINE_SIZE = 'lineSize',
	COLOR = 'color',
	CONTOUR_COLOR = 'contourColor',
	UNDO = 'undo',
	REDO = 'redo',
	GUIDE_LINES = 'guideLines',
}

interface State {
	tool: ACTIONS;
	fontSize: number;
	strokeWidth: number;
	fillColor: string;
	strokeStyle: string;
}

const initialState: State = {
	tool: ACTIONS.SELECT,
	fontSize: 16,
	strokeWidth: 1,
	fillColor: '#000000',
	strokeStyle: '#000000',
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
