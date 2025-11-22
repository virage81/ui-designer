import '@testing-library/jest-dom';

jest.mock('uuid', () => ({
	v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

jest.mock('@components/EmptyProjectsState', () => ({
	EmptyProjectsState: () => <div data-testid='empty-state'>Empty State</div>,
}));

jest.mock('@components/ProjectCard', () => ({
	ProjectCard: ({ title }: { title: string }) => <div data-testid='project-card'>{title}</div>,
}));
