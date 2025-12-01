import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { HistoryTab } from './components/HistoryTab';
import { LayersTab } from './components/LayersTab';

export const RightSideBar: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0);

	const handleChange = (_: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				width: 320,
				borderLeft: '1px solid',
				borderColor: 'var(--header-border-color)',
			}}>
			<Tabs value={activeTab} onChange={handleChange}>
				<Tab label='Слои' sx={{ width: '50%' }} />
				<Tab label='История' sx={{ width: '50%' }} />
			</Tabs>

			<Box
				sx={{
					flex: 1,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					p: 1,
					color: 'var(--color)',
					backgroundColor: 'var(--header-bg)',
				}}>
				{activeTab === 0 && <LayersTab />}
				{activeTab === 1 && <HistoryTab />}
			</Box>
		</Box>
	);
};
