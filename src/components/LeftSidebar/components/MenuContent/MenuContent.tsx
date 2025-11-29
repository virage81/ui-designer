import { Box, Slider, Typography } from '@mui/material';
import { COLOR_PALETTE } from '@shared/config';
import type { RootState } from '@store/index';
import { ACTIONS, setFillColor, setFontSize, setStrokeColor, setStrokeWidth } from '@store/slices/toolsSlice';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface MenuContentProps {
	currentSetting: ACTIONS | null;
}

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
