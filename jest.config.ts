const config = {
	preset: 'ts-jest',
	transform: {
		'^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
	},
	testEnvironment: 'jsdom',
	transformIgnorePatterns: ['node_modules'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	moduleNameMapper: {
		'\\.(css|less|png)$': '<rootDir>/spec/__mocks__/styleMock.js',
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@store/(.*)$': '<rootDir>/src/store/$1'
	},
};

export default config;
