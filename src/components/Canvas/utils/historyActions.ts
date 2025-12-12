import { HISTORY_ACTIONS } from '@store/slices/projectsSlice.enums';
import type { Dispatch } from 'redux';
import { restoreLayerObjects, restoreObjects, clearLayerCanvas, clearObjects, restoreObject, updateObject } from '@store/slices/canvasSlice';
import type { ACTIONS } from '@store/slices/toolsSlice';


export const handleHistoryAction = (
	dispatch: Dispatch,
	historyType: HISTORY_ACTIONS | ACTIONS,
	layerId: string,
	pointer: number,
	isUndo: boolean,
	erasedObjectId?: string
) => {
	switch (historyType) {
		case HISTORY_ACTIONS.LAYER_CLEAR:
			if (isUndo) {
				dispatch(restoreLayerObjects(layerId));
			} else {
				dispatch(clearLayerCanvas(layerId));
			}
			break;

		case HISTORY_ACTIONS.ERASER:
			if (isUndo && erasedObjectId) {
				dispatch(restoreObject({ id: erasedObjectId }));
			} else if (!isUndo && erasedObjectId) {
				dispatch(updateObject({
					id: erasedObjectId,
					updates: { removed: true }
				}));
			}
			break;
		// case HISTORY_ACTIONS.ERASER:
		// 	if (isUndo) {
		// 		dispatch(restoreObjects({ layerId, start: pointer + 1, end: pointer + 1 }));
		// 	} else {
		// 		dispatch(clearObjects({ layerId, start: pointer, end: pointer }));
		// 	}
		// 	break;

		case HISTORY_ACTIONS.RECTANGLE:
		case HISTORY_ACTIONS.BRUSH:
		case HISTORY_ACTIONS.CIRCLE:
		case HISTORY_ACTIONS.TEXT:
		case HISTORY_ACTIONS.LINE:
			if (isUndo) {
				dispatch(clearObjects({ layerId, start: pointer, end: pointer }));
			} else {
				dispatch(restoreObjects({ layerId, start: pointer + 1, end: pointer + 1 }));
			}
			break;

		default:
			break;
	}
};
