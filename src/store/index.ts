import { combineReducers, configureStore } from '@reduxjs/toolkit';
import historyReducer from '@store/slices/historySlice';
import layerReducer from '@store/slices/layerSlice';
import projectReducer from '@store/slices/projectSlice';
import projectsReducer from '@store/slices/projectsSlice';
import { FLUSH, PAUSE, PERSIST, PURGE, REHYDRATE, persistReducer, persistStore } from 'redux-persist';
import localStorage from 'redux-persist/lib/storage';

const rootReducer = combineReducers({
	project: projectReducer,
	projects: projectsReducer,
	history: historyReducer,
	layers: layerReducer,
});

const persistConfig = {
	key: 'ui-designer',
	storage: localStorage,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [PERSIST, REHYDRATE, FLUSH, PAUSE, PURGE],
			},
		}),
	devTools: true,
});

persistStore(store);

export const setupStore = (preloadedState?: Partial<RootState>) => {
	return configureStore({
		reducer: rootReducer,
		preloadedState,
	});
};

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;
