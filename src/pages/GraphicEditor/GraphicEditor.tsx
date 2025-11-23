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

				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						flexGrow: 1,
						gap: '0.5rem',
						width: '63px',
						padding: '8px 8px',
						backgroundColor: 'var(--main-bg)',
					}}>
					<Canvas />
				</Box>
				<RightSideBar />
			</Box>
		</div>
	);
};
