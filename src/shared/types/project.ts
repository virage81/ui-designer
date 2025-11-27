export interface Project {
	id: string;
	name: string;
	date: string;
	width: number;
	height: number;
	preview: string;
}

export interface History {
	id: string;
	date: string;
	typeOfEntry: string;
	isActive: boolean;
}

export interface Layer {
	id: string;
	name: string;
	isBase: boolean;
	opacity: number;
	zIndex: number;
	hidden: boolean;
	cleared?: boolean;
}
