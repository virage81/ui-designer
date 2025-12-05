import { useContext } from 'react';
import { CanvasContext } from './canvasContext.types';

export const useCanvasContext = () => {
	const ctx = useContext(CanvasContext);
	if (!ctx) throw new Error('CanvasContext not found');
	return ctx;
};
