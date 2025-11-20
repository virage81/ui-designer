import { Box, Button, DialogActions, Modal, Typography } from '@mui/material';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 500,
	bgcolor: 'var(--main-bg)',
	color: 'var(--color)',
	border: '2px solid var(--header-modal-border-color)',
	borderRadius: 1.2,
	p: 2.1,
};

interface DeleteConfirmModalProps {
	open: boolean;
	handleClose: () => void;
	projectName: string;
} //TODO удалить (для теста)

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ open, handleClose, projectName }) => {
	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby='modal-modal-title'
			aria-describedby='modal-modal-description'>
			<Box sx={style}>
				<Typography
					component='h2'
					sx={{
						fontSize: '1.2rem',
						fontWeight: 600,
					}}>
					Удалить проект?
				</Typography>
				<Typography
					variant='body2'
					sx={{
						mt: 1,
						color: 'var(--color-dark)',
						fontSize: '1rem',
					}}>
					Вы уверены, что хотите удалить проект: "{projectName}"? Это действие нельзя отменить
				</Typography>
				<DialogActions>
					<Button
						variant='outlined'
						sx={{
							textTransform: 'none',
							fontWeight: 600,
							color: 'var(--color)',
							borderColor: 'var(--header-modal-border-color)',
						}}
						onClick={handleClose}>
						Отмена
					</Button>
					<Button
						variant='contained'
						color='error'
						sx={{
							textTransform: 'none',
							fontWeight: 600,
						}}>
						Удалить
					</Button>
				</DialogActions>
			</Box>
		</Modal>
	);
};
