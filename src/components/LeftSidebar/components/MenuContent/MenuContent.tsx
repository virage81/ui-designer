import { Box, Slider, Typography } from '@mui/material';
import type { RootState } from '@store/index';
import { ACTIONS, setFillColor, setFontSize, setStrokeColor, setStrokeWidth } from '@store/slices/toolsSlice';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface MenuContentProps {
	currentSetting: ACTIONS | null;
}

const COLOR_PALETTE = [
	'#000000',
	'#434343',
	'#666666',
	'#999999',
	'#b7b7b7',
	'#cccccc',
	'#d9d9d9',
	'#efefef',
	'#ffffff',
	'rgba(0, 0, 0, 0)',
	'#980000',
	'#ff0000',
	'#ff9900',
	'#ffff00',
	'#00ff00',
	'#00ffff',
	'#4a86e8',
	'#0000ff',
	'#9900ff',
	'#ff00ff',
	'#e6b8af',
	'#f4cccc',
	'#fce5cd',
	'#fff2cc',
	'#d9ead3',
	'#d0e0e3',
	'#c9daf8',
	'#cfe2f3',
	'#d9d2e9',
	'#ead1dc',
	'#dd7e6b',
	'#ea9999',
	'#f9cb9c',
	'#ffe599',
	'#b6d7a8',
	'#a2c4c9',
	'#a4c2f4',
	'#9fc5e8',
	'#b4a7d6',
	'#d5a6bd',
];

export const MenuContent: React.FC<MenuContentProps> = ({ currentSetting }) => {
	const { fillColor, strokeWidth, strokeStyle, fontSize } = useSelector((state: RootState) => state.tools);

	const [selectedFontSize, setSelectedFontSize] = useState<number>(fontSize);
	const [selectedLineSize, setSelectedLineSize] = useState<number>(strokeWidth);
	const [selectedColor, setSelectedColor] = useState<string>(fillColor);
	const [selectedContourColor, setSelectedContourColor] = useState<string>(strokeStyle);

	const dispatch = useDispatch();

	const handleFontSizeChange = useCallback(
		(event: Event, newValue: number) => {
			setSelectedFontSize(newValue);
			dispatch(setFontSize(newValue));
		},
		[dispatch],
	);

	const handleLineSizeChange = useCallback(
		(event: Event, newValue: number) => {
			setSelectedLineSize(newValue);
			dispatch(setStrokeWidth(newValue));
		},
		[dispatch],
	);

	const handleColorSelect = useCallback(
		(color: string) => {
			setSelectedColor(color);
			dispatch(setFillColor(color));
		},
		[dispatch],
	);

	const handleContourColorSelect = useCallback(
		(color: string) => {
			setSelectedContourColor(color);
			dispatch(setStrokeColor(color));
		},
		[dispatch],
	);

	switch (currentSetting) {
		case ACTIONS.FONT:
			return (
				<Box sx={{ p: 2, minWidth: 200 }}>
					<Typography variant='subtitle1' gutterBottom>
						Размер шрифта: {selectedFontSize}px
					</Typography>
					<Slider
						value={selectedFontSize}
						onChange={handleFontSizeChange}
						min={8}
						max={72}
						step={1}
						valueLabelDisplay='auto'
						sx={{ mb: 2 }}
					/>
				</Box>
			);

		case ACTIONS.COLOR:
		case ACTIONS.CONTOUR_COLOR:
			return (
				<Box sx={{ p: 2, minWidth: 200 }}>
					<Typography variant='subtitle1' gutterBottom>
						{currentSetting === ACTIONS.COLOR ? 'Основной цвет' : 'Цвет контура'}
					</Typography>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							mb: 2,
							p: 1,
							border: '1px solid var(--header-border-color)',
							borderRadius: 1,
						}}>
						<Box
							sx={{
								width: 24,
								height: 24,
								backgroundColor: `${currentSetting === ACTIONS.COLOR ? selectedColor : selectedContourColor}`,
								border: '1px solid var(--header-border-color)',
								mr: 2,
							}}
						/>
						<Typography variant='body2'>
							{currentSetting === ACTIONS.COLOR ? selectedColor : selectedContourColor}
						</Typography>
					</Box>
					<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5 }}>
						{COLOR_PALETTE.map(color => (
							<Box
								key={color}
								sx={{
									width: 24,
									height: 24,
									backgroundColor: color,
									border: '1px solid var(--header-border-color)',
									cursor: 'pointer',
									'&:hover': {
										border: '2px solid #000',
									},
								}}
								onClick={
									currentSetting === ACTIONS.COLOR
										? () => handleColorSelect(color)
										: () => handleContourColorSelect(color)
								}
							/>
						))}
					</Box>
				</Box>
			);

		case ACTIONS.LINE_SIZE:
			return (
				<Box sx={{ p: 2, minWidth: 200 }}>
					<Typography variant='subtitle1' gutterBottom>
						Толщина линии: {selectedLineSize}px
					</Typography>
					<Slider
						value={selectedLineSize}
						onChange={handleLineSizeChange}
						min={1}
						max={20}
						step={1}
						valueLabelDisplay='auto'
					/>
				</Box>
			);

		default:
			return null;
	}
};
