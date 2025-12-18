import { Box, Button, DialogActions, Modal, Typography } from '@mui/material';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 520,
	bgcolor: 'var(--main-bg)',
	color: 'var(--color)',
	border: '2px solid var(--header-modal-border-color)',
	outline: 'none',
	borderRadius: 1.2,
	p: 2.1,
};

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
			aria-describedby='hotkeys-modal-description'
		>
			<Box sx={style}>
				<Typography
					id='hotkeys-modal-title'
					component='h2'
					sx={{ fontSize: '1.2rem', fontWeight: 600 }}
				>
					Горячие клавиши:
				</Typography>

				<Box
					id='hotkeys-modal-description'
					sx={{ mt: 1.5, color: 'var(--color-dark)', fontSize: '0.95rem' }}
				>
					<Typography>(1-7) — Выбор инструмента</Typography>
					<Typography>(Ctrl + S) — Сохранить проект</Typography>
					<Typography>(Ctrl + E) — Экспорт в PNG</Typography>
					<Typography>(Ctrl + Alt + N) — Создать новый проект</Typography>
					<Typography>(Ctrl + Z) — Отменить действие</Typography>
					<Typography>(Ctrl + Shift + Z) — Вернуть действие</Typography>
					<Typography>(+) — Увеличить полотно</Typography>
					<Typography>(-) — Уменьшить полотно</Typography>
					<Typography>(Ctrl+↑) — Переместить выделенный слой вверх</Typography>
					<Typography>(Ctrl+↓) — Переместить выделенный слой вниз</Typography>
					<Typography>(↑) — Переключиться на слой выше</Typography>
					<Typography>(↓) — Переключиться на слой ниже</Typography>
					<Typography>(F1) — Открыть список горячих клавиш</Typography>
				</Box>

				<DialogActions sx={{ mt: 2 }}>
					<Button
						variant='outlined'
						onClick={onClose}
						sx={{
							textTransform: 'none',
							fontWeight: 600,
							color: 'var(--color)',
							borderColor: 'var(--header-modal-border-color)',
						}}
					>
						Закрыть
					</Button>
				</DialogActions>
			</Box>
		</Modal>
	);
};
