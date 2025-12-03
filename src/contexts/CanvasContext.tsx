import { type ReactNode, useRef, useCallback, useMemo } from 'react';
import { CanvasContext, type CanvasMap, type CanvasRegistry } from './canvasContext.types';

export const CanvasContextProvider = ({ children }: { children: ReactNode }) => {
	const canvasesRef = useRef<CanvasMap>({});

	const register = useCallback((layerId: string, canvas: HTMLCanvasElement) => {
		canvasesRef.current[layerId] = canvas;
	}, []);

	const unregister = useCallback((layerId: string) => {
		delete canvasesRef.current[layerId];
	}, []);

	const contextValue = useMemo<CanvasRegistry>(() => ({
		register,
		unregister,
		get canvases() {
			return canvasesRef.current;
		},
	}), [register, unregister]);

	return (
		<CanvasContext.Provider value={contextValue}>
			{children}
		</CanvasContext.Provider>
	);
};
