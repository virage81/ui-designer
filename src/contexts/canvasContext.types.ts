import { createContext } from 'react';

export type CanvasMap = Record<string, HTMLCanvasElement>;

export interface CanvasRegistry {
	register: (layerId: string, canvas: HTMLCanvasElement) => void;
	unregister: (layerId: string) => void;
	canvases: CanvasMap;
}

export const CanvasContext = createContext<CanvasRegistry | null>(null);
