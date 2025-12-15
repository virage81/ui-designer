const config = {
	preset: 'ts-jest',
	transform: {
		'^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
	},
	testEnvironment: 'jsdom',
	transformIgnorePatterns: ['node_modules'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
	moduleNameMapper: {
		'\\.(css|less|png)$': '<rootDir>/tests/__mocks__/styleMock.js',
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@pages/(.*)$': '<rootDir>/src/pages/$1',
		'^@components/(.*)$': '<rootDir>/src/components/$1',
		'^@store/(.*)$': '<rootDir>/src/store/$1',
		'^@shared/(.*)$': '<rootDir>/src/shared/$1',
	},
};

export default config;
