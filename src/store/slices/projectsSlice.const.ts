import { HISTORY_ACTIONS } from "./projectsSlice.enums";
import { ACTIONS } from "./toolsSlice";

export const HISTORY_NAMES: Record<HISTORY_ACTIONS | ACTIONS, string> = {
	[HISTORY_ACTIONS.SELECT]: 'Выбор объекта',
	[HISTORY_ACTIONS.BRUSH]: 'Кисть',
	[HISTORY_ACTIONS.RECTANGLE]: 'Прямоугольник',
	[HISTORY_ACTIONS.CIRCLE]: 'Круг',
	[HISTORY_ACTIONS.ERASER]: 'Ластик',
	[HISTORY_ACTIONS.TEXT]: 'Текст',
	[HISTORY_ACTIONS.LINE]: 'Линия',
	[HISTORY_ACTIONS.UNDO]: 'Отмена действия',
	[HISTORY_ACTIONS.REDO]: 'Повтор действия',
	[ACTIONS.FONT]: 'Размер шрифта',
	[ACTIONS.LINE_SIZE]: 'Высота линии',
	[ACTIONS.COLOR]: 'Цвет',
	[ACTIONS.CONTOUR_COLOR]: 'Цвет контура',
	[ACTIONS.GUIDE_LINES]: 'Линии',
	[HISTORY_ACTIONS.LAYER_ADD]: 'Добавление слоя',
	[HISTORY_ACTIONS.LAYER_CLEAR]: 'Очистка слоя',
	[HISTORY_ACTIONS.LAYER_DELETE]: 'Удаление слоя',
	[HISTORY_ACTIONS.LAYER_OPACITY]: 'Изменение прозрачности',
	[HISTORY_ACTIONS.LAYER_RENAME]: 'Переименование слоя',
	[HISTORY_ACTIONS.LAYER_ACTIVE]: 'Смена активного слоя',
	[HISTORY_ACTIONS.LAYER_ORDER]: 'Изменение порядка слоев',
	[HISTORY_ACTIONS.LAYER_HIDE]: 'Скрытие слоя',
};
