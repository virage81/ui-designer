import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import {toggleCreateProjectModal} from "@store/slices/modalsSlice.ts";
import {useDispatch} from "react-redux";

export const EmptyProjectsState: React.FC = () => {
	const dispatch = useDispatch();
	return (
		<Box
			sx={{
				textAlign: 'center',
				mt: 10,
			}}>
			<Typography variant='body2' sx={{ mt: 2, color: 'var(--color-dark)', fontSize: '1rem' }}>
				У вас пока нет проектов
			</Typography>
			<Button
				variant='contained'
				startIcon={<Add />}
				sx={{
					textTransform: 'none',
					mt: 2,
				}}
				onClick={() => dispatch(toggleCreateProjectModal())}
			>
				Создать первый проект
			</Button>
		</Box>
	);
};
