import '@testing-library/jest-dom';
import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;

jest.mock('uuid', () => {
	let i = 0;
	return {
		v4: jest.fn(() => `mocked-uuid-${i++}`),
	};
});

jest.mock('@components/EmptyProjectsState', () => ({
	EmptyProjectsState: () => <div data-testid='empty-state'>Empty State</div>,
}));

jest.mock('@components/ProjectCard', () => ({
	ProjectCard: ({ title }: { title: string }) => <div data-testid='project-card'>{title}</div>,
}));
