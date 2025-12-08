import { Box } from '@mui/material';

interface GridOverlayProps {
	guides: {
		enabled: boolean
		columns: number
		rows: number
	}
}

export const GridOverlay: React.FC<GridOverlayProps> = ({guides}) => {
	const GRID_COLS: number = guides.columns || 1;
	const GRID_ROWS: number = guides.rows || 1;
	const totalCells: number = GRID_COLS * GRID_ROWS;

	return (
		<Box
			sx={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				pointerEvents: 'none',
				zIndex: 1000,
				display: 'grid',
				gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
				gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
				gap: 0,
				...(guides.enabled && {
					'& > div': {
						border: '1px dashed lightgrey',
						boxSizing: 'border-box',
					},
					'& > div:nth-of-type(-n + ${GRID_COLS})': { borderTop: 'none' },
					'& > div:nth-of-type(n + ${GRID_COLS * (GRID_ROWS - 1) + 1})': { borderBottom: 'none' },
					'& > div:nth-of-type(n+1)': { borderLeft: 'none' },
					'& > div:nth-of-type(${GRID_COLS}n)': { borderRight: 'none' },
				}),
			}}
		>
			{Array.from({ length: totalCells }).map((_, i) => (
				<Box key={i} />
			))}
		</Box>
	);
};
