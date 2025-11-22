import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

global.TextDecoder = TextDecoder as any;
global.TextEncoder = TextEncoder as any;

jest.mock('uuid', () => ({
	v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

jest.mock('@components/EmptyProjectsState', () => ({
	EmptyProjectsState: () => <div data-testid='empty-state'>Empty State</div>,
}));

jest.mock('@components/ProjectCard', () => ({
	ProjectCard: ({ title }: { title: string }) => <div data-testid='project-card'>{title}</div>,
}));
