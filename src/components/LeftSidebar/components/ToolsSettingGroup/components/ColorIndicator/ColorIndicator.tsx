interface ColorIndicatorProps {
	bgColor: string;
}

export const ColorIndicator: React.FC<ColorIndicatorProps> = ({ bgColor }) => {
	return (
		<span
			style={{
				position: 'absolute',
				top: 3,
				right: 3,
				width: '15px',
				height: '15px',
				border: '1px solid var(--color)',
				borderRadius: '50%',
				backgroundColor: bgColor,
			}}></span>
	);
};
