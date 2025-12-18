import { Box, FormControlLabel, Slider, Switch, TextField, Typography } from '@mui/material';
import { SIZE_PRESETS, WIDTH_PRESETS } from '@shared/config';
import type { RootState } from '@store/index';
import { ACTIONS, setFillColor, setFontSize, setStrokeColor, setStrokeWidth } from '@store/slices/toolsSlice';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enableGuides, setGuidesColumns, setGuidesRows } from '@store/slices/projectsSlice.ts';
import { SketchPicker } from 'react-color';
import styles from './MenuContent.module.css';

interface MenuContentProps {
	currentSetting: ACTIONS | null;
}

export const MenuContent: React.FC<MenuContentProps> = ({ currentSetting }) => {
	const { fillColor, strokeWidth, strokeStyle, fontSize } = useSelector((state: RootState) => state.tools);
	const guides = useSelector((state: RootState) => state.projects.guides);
	const [selectedFontSize, setSelectedFontSize] = useState<number>(fontSize);
	const [selectedLineSize, setSelectedLineSize] = useState<number>(strokeWidth);
	const [selectedColor, setSelectedColor] = useState<string>(fillColor);
	const [selectedContourColor, setSelectedContourColor] = useState<string>(strokeStyle);
	const dispatch = useDispatch();

	const handleFontSizeChange = useCallback(
		(newValue: number) => {
			setSelectedFontSize(newValue);
			dispatch(setFontSize(newValue));
		},
		[dispatch],
	);

	const handleLineSizeChange = useCallback(
		(newValue: number) => {
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
						onChange={(_, value) => handleFontSizeChange(value)}
						min={8}
						max={72}
						step={1}
						valueLabelDisplay='auto'
						sx={{ mb: 2 }}
					/>
					<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
						{SIZE_PRESETS.map(size => (
							<Box
								key={size}
								sx={{
									p: 1,
									border: '1px solid var(--header-border-color)',
									borderRadius: '5px',
									cursor: 'pointer',
									'&:hover': { border: '1px solid var(--active-color-primary)', bgcolor: 'var(--hover-bg)' },
								}}
								onClick={() => handleFontSizeChange(size)}>
								{`${size}px`}
							</Box>
						))}
					</Box>
				</Box>
			);

		case ACTIONS.COLOR:
		case ACTIONS.CONTOUR_COLOR:
			return (
				<Box sx={{ p: 2, minWidth: 200 }}>
					<Typography variant='subtitle1' gutterBottom>
						{currentSetting === ACTIONS.COLOR ? 'Основной цвет' : 'Цвет контура'}
					</Typography>
					<SketchPicker
						className={styles.sketchPicker}
						color={currentSetting === ACTIONS.COLOR ? selectedColor : selectedContourColor}
						onChange={color => {
							const { r, g, b, a } = color.rgb;
							const rgbaString = `rgba(${r}, ${g}, ${b}, ${a})`;
							const selectedHandler = currentSetting === ACTIONS.COLOR ? handleColorSelect : handleContourColorSelect;
							selectedHandler(rgbaString);
						}}
						styles={{
							default: {
								picker: {
									background: 'var(--picker-bg)',
									boxShadow: 'unset',
									border: 'unset',
								},
							},
						}}
					/>
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
						onChange={(_, value) => handleLineSizeChange(value)}
						min={1}
						max={30}
						step={1}
						valueLabelDisplay='auto'
					/>
					<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
						{WIDTH_PRESETS.map(width => (
							<Box
								key={width}
								sx={{
									p: 1,
									border: '1px solid var(--header-border-color)',
									borderRadius: '5px',
									cursor: 'pointer',
									'&:hover': { border: '1px solid var(--active-color-primary)', bgcolor: 'var(--hover-bg)' },
								}}
								onClick={() => handleLineSizeChange(width)}>
								{`${width}px`}
							</Box>
						))}
					</Box>
				</Box>
			);

		case ACTIONS.GUIDE_LINES:
			return (
				<Box sx={{ p: 2, minWidth: 200 }}>
					<Typography variant='subtitle1' gutterBottom>
						Направляющие
					</Typography>
					<FormControlLabel
						control={<Switch checked={guides.enabled} onChange={e => dispatch(enableGuides(e.target.checked))} />}
						label='Показать'
						sx={{ mb: 2 }}
					/>

					<Box sx={{ mb: 2 }}>
						<Typography variant='caption' sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
							Столбцы
						</Typography>
						<TextField
							type='number'
							size='small'
							slotProps={{ htmlInput: { min: 0, max: 20, style: { textAlign: 'center' } } }}
							value={guides.columns}
							onChange={e => dispatch(setGuidesColumns(Math.max(0, Math.min(20, Number(e.target.value)))))}
							sx={{ width: '100%', mb: 1 }}
						/>

						<Typography variant='caption' sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
							Строки
						</Typography>
						<TextField
							type='number'
							size='small'
							slotProps={{ htmlInput: { min: 0, max: 20, style: { textAlign: 'center' } } }}
							value={guides.rows}
							onChange={e => dispatch(setGuidesRows(Math.max(0, Math.min(20, Number(e.target.value)))))}
							sx={{ width: '100%' }}
						/>
					</Box>
					<Typography variant='caption' sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
						Для привязки удерживайте CTRL
					</Typography>
				</Box>
			);

		default:
			return null;
	}
};
