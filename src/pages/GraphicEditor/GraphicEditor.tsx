import { Canvas } from '@components/Canvas';
import { LeftSidebar } from '@components/LeftSidebar';
import { RightSideBar } from '@components/RightSidebar';
import { TopMenu } from '@components/TopMenu';
import { Box } from '@mui/material';
import type {RootState} from "@/store";
import type {Project} from "@shared/types/project.ts";
import {Navigate, useParams} from "react-router-dom";
import {useSelector} from "react-redux";

export const GraphicEditor: React.FC = () => {
	const selectProjectExists = (state: RootState, id: string) => {
		return state.projects.projects.some((p: Project) => p.id === id);
	}

	const { id } = useParams<{ id: string }>();
	const exists: boolean = useSelector((state: RootState) => selectProjectExists(state, id ?? ''));

	if (!exists) {
		return <Navigate to="/404" replace />;
	}

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
