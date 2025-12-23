import { Box, Modal, Typography } from '@mui/material';

interface HelpModalProps {
	open: boolean;
	onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
	return (
		<Modal
			open={open}
			onClose={onClose}
			aria-labelledby='hotkeys-modal-title'
			aria-describedby='hotkeys-modal-description'>
			<Box
				sx={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: 500,
					bgcolor: 'var(--main-bg)',
					color: 'var(--color)',
					border: '1px solid var(--header-border-color)',
					borderRadius: '10px',
					outline: 'none',
					p: 3,
				}}>
				<Typography id='hotkeys-modal-title' variant='subtitle2' sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
					Горячие клавиши:
				</Typography>

				<Box
					id='hotkeys-modal-description'
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: 0.75,
						mt: 1.5,
						color: 'var(--color-dark)',
					}}>
					<Typography>(1-7) — Выбор инструмента</Typography>
					<Typography>(Ctrl + S) — Сохранить проект</Typography>
					<Typography>(Ctrl + E) — Экспорт в PNG</Typography>
					<Typography>(Ctrl + Alt + N) — Создать новый проект</Typography>
					<Typography>(Ctrl + Z) — Отменить действие</Typography>
					<Typography>(Ctrl + Shift + Z) — Вернуть действие</Typography>
					<Typography>(+) — Увеличить полотно</Typography>
					<Typography>(-) — Уменьшить полотно</Typography>
					<Typography>(Ctrl + ↑) — Переместить выделенный слой вверх</Typography>
					<Typography>(Ctrl + ↓) — Переместить выделенный слой вниз</Typography>
					<Typography>(↑) — Переключиться на слой выше</Typography>
					<Typography>(↓) — Переключиться на слой ниже</Typography>
					<Typography>(F1) — Открыть список горячих клавиш</Typography>
				</Box>
			</Box>
		</Modal>
	);
};
