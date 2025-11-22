import { setupStore, type AppStore, type RootState } from '@store/index';
import { render, type RenderOptions } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

interface ExtendedRenderOptions extends RenderOptions {
	preloadedState?: Partial<RootState>;
	store?: AppStore;
}

export const JestStoreProvider = (children: ReactElement, extendedRenderOptions: ExtendedRenderOptions = {}) => {
	const { preloadedState = {}, store = setupStore(preloadedState), ...renderOptions } = extendedRenderOptions;

	const Wrapper = ({ children }: PropsWithChildren) => (
		<MemoryRouter>
			<Provider store={store}>{children}</Provider>
		</MemoryRouter>
	);

	return {
		store,
		...render(children, { wrapper: Wrapper, ...renderOptions }),
	};
};
