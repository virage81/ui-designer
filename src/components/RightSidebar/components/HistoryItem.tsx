import { Paper, Typography } from "@mui/material";
import type { History } from "@shared/types/project";

export const HistoryItem: React.FC<History> = ({ id, date, type }) => {
	return (
		<Paper
			key={id}
			elevation={0}
			sx={{
				p: 1,
				mb: 0.5,
				borderRadius: 1,
				bgcolor: 'var(--header-border-color)',
				color: 'var(--color)',
				cursor: 'pointer',
				transition: 'all 0.2s ease',
				'&:hover': {
					bgcolor: 'var(--hover-bg)',
				},
			}}>
			<Typography variant='body2' sx={{ color: 'var(--color)' }}>
				{type}
			</Typography>
			<Typography variant='caption' sx={{ color: 'var(--color)', mt: 0.5, display: 'block' }}>
				{date}
			</Typography>
		</Paper>
	);
};
