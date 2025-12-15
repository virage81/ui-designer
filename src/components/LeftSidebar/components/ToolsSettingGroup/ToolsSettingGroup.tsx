import { LineWeight } from '@mui/icons-material';
import { Box, Button, Menu } from '@mui/material';
import type { RootState } from '@store/index';
import { ACTIONS } from '@store/slices/toolsSlice';
import { Grid2X2Icon, PaletteIcon, SquareDashedIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { MenuContent } from '../MenuContent';
import { ColorIndicator } from './components/ColorIndicator';

const SETTING_TOOLS = [
	// { id: ACTIONS.FONT, icon: <BaselineIcon size={16} color={'var(--color)'} />, label: 'Шрифт' },
	{ id: ACTIONS.LINE_SIZE, icon: <LineWeight />, label: 'Размер линии' },
	{ id: ACTIONS.COLOR, icon: <PaletteIcon size={16} color={'var(--color)'} />, label: 'Цвет' },
	{ id: ACTIONS.CONTOUR_COLOR, icon: <SquareDashedIcon size={16} color={'var(--color)'} />, label: 'Контурный цвет' },
	{ id: ACTIONS.GUIDE_LINES, icon: <Grid2X2Icon size={16} color={'var(--color)'} />, label: 'Направляющие' },
];

export const ToolsSettingGroup: React.FC = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [currentSetting, setCurrentSetting] = useState<ACTIONS | null>(null);

	const { fillColor, strokeStyle } = useSelector((state: RootState) => state.tools);

	const isMenuOpen = Boolean(anchorEl);

	const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLButtonElement>, settingId: ACTIONS) => {
		setAnchorEl(event.currentTarget);
		setCurrentSetting(settingId);
	}, []);

	const handleCloseMenu = useCallback(() => {
		setAnchorEl(null);
		setCurrentSetting(null);
	}, []);

	return (
		<>
			<Box>
				{SETTING_TOOLS.map(tool => (
					<Button key={tool.id} variant='graphic-tools' title={tool.label} onClick={e => handleOpenMenu(e, tool.id)}>
						{tool.icon}
						{tool.id === ACTIONS.COLOR && <ColorIndicator bgColor={fillColor} />}
						{tool.id === ACTIONS.CONTOUR_COLOR && <ColorIndicator bgColor={strokeStyle} />}
					</Button>
				))}
			</Box>
			<Menu
				anchorEl={anchorEl}
				open={isMenuOpen}
				onClose={handleCloseMenu}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				sx={{
					'& .MuiPaper-root': {
						borderRadius: 2,
						marginLeft: 6,
						backgroundColor: 'var(--header-bg)',
						backgroundImage: 'none',
						border: '1px solid var(--header-border-color)',
					},
					'& .MuiMenu-list': {
						padding: 0,
					},
				}}>
				<MenuContent currentSetting={currentSetting} />
			</Menu>
		</>
	);
};
