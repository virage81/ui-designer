import { Box, Divider, Stack } from '@mui/material';
import { ToolsGroup } from './components/ToolsGroup';
import { ToolsHistoryGroup } from './components/ToolsHistoryGroup';
import { ToolsSettingGroup } from './components/ToolsSettingGroup';

export const LeftSidebar: React.FC = () => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '0.5rem',
				width: '63px',
				padding: '8px 8px',
				borderRight: '1px solid',
				borderColor: 'var(--header-border-color)',
				backgroundColor: 'var(--header-bg)',
			}}>
			<Stack direction='column' spacing={1} divider={<Divider orientation='horizontal' flexItem />}>
				<ToolsGroup />
				<ToolsSettingGroup />
				<ToolsHistoryGroup />
			</Stack>
		</Box>
	);
};
