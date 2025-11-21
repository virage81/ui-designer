export interface Project {
	id: number;
	name: string;
	date: string;
	width: number;
	height: number;
	preview: string;
}

export interface History {
	id: number;
	date: string;
	typeOfEntry: string;
	isActive: boolean;
}

export interface Layer {
	id: string;
	name: string;
	opacity: number;
	zIndex: number;
	hidden: boolean;
}
