import { Canvas } from '@components/Canvas';
import { LeftSidebar } from '@components/LeftSidebar';
import { RightSideBar } from '@components/RightSidebar';
import { TopMenu } from '@components/TopMenu';
import { Box } from '@mui/material';

export const GraphicEditor: React.FC = () => {
	return (
		<div>
			<TopMenu />
			<Box sx={{ display: 'flex', height: 'calc(100vh - 49px)', width: '100%' }}>
				<LeftSidebar />
				<Canvas />
				<RightSideBar />
			</Box>
		</div>
	);
};
