export interface Rect {
	id: string;
	type: 'rect';
	x: number;
	y: number;
	width: number;
	height: number;
	fill: string;
	stroke: string;
	strokeWidth: number;
	layerId: string;
	projectId: string;
	pointer: number;
	removed: boolean;
}

export interface Circle {
	id: string;
	type: 'circle';
	cx: number;
	cy: number;
	r: number;
	fill: string;
	stroke: string;
	strokeWidth: number;
	layerId: string;
	projectId: string;
	pointer: number;
	removed: boolean;
}

export interface Line {
	id: string;
	type: 'line';
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	stroke: string;
	strokeWidth: number;
	layerId: string;
	projectId: string;
	pointer: number;
	removed: boolean;
}

export interface Text {
	id: string;
	type: 'text';
	x: number;
	y: number;
	width?: number;
	height?: number;
	lines?: string[];
	text: string;
	fontSize: number;
	fill: string;
	layerId: string;
	projectId: string;
	pointer: number;
	removed: boolean;
}

export interface Brush {
	id: string;
	type: 'brush';
	points: { x: number; y: number }[];
	stroke: string;
	strokeWidth: number;
	layerId: string;
	projectId: string;
	pointer: number;
	removed: boolean;
}

export type Drawable = Rect | Circle | Line | Text | Brush;

export interface CanvasState {
	objects: Drawable[];
}

export interface BBox {
	x: number;
	y: number;
	width: number;
	height: number;
}
