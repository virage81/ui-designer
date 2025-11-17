import { listOfProjectSlice } from '@components/Projects/listOfProjectSlice';
import { projectSlice } from '@components/Project/projectSlice';
import { projectHistorySlice } from '@components/History/projectHistorySlice';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import localStorage from 'redux-persist/lib/storage';

const rootReducer = combineReducers({
	projectSlice: projectSlice.reducer,
	listOfProjectSlice: listOfProjectSlice.reducer,
	projectHistorySlice: projectHistorySlice.reducer,
});
const persistConfig = {
	key: 'root',
	storage: localStorage,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
			},
		}),
	devTools: true,
});

store.subscribe(() => {
	localStorage.setItem('name of LS item', JSON.stringify(store.getState()))
})

export const setupStore = (preloadedState?: Partial<RootState>) => {
	return configureStore({
		reducer: rootReducer,
		preloadedState,
	});
};

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;
