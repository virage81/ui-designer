import { createContext, useContext, useRef, type ReactNode } from 'react';

type CanvasMap = Record<string, HTMLCanvasElement>;

interface CanvasRegistry {
	register: (layerId: string, canvas: HTMLCanvasElement) => void;
	unregister: (layerId: string) => void;
	canvases: CanvasMap;
}

const CanvasContext = createContext<CanvasRegistry | null>(null);

export const useCanvasContext = () => {
	const ctx = useContext(CanvasContext);
	if (!ctx) throw new Error('CanvasContext not found');
	return ctx;
};

export const CanvasContextProvider = ({ children }: { children: ReactNode }) => {
	const canvasesRef = useRef<CanvasMap>({});

	const register = (layerId: string, canvas: HTMLCanvasElement) => {
		canvasesRef.current[layerId] = canvas;
	};

	const unregister = (layerId: string) => {
		delete canvasesRef.current[layerId];
	};

	return (
		<CanvasContext.Provider
			value={{ register, unregister, canvases: canvasesRef.current }}
		>
			{children}
		</CanvasContext.Provider>
	);
};
