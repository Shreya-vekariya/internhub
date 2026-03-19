import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSclice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
	auth: authReducer,
});

const persistConfig = {
	key: "root",
	storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// Ignore redux-persist internal actions
				ignoredActions: [
					"persist/PERSIST",
					"persist/REHYDRATE",
					"persist/FLUSH",
					"persist/PAUSE",
					"persist/PURGE",
					"persist/REGISTER",
				],
			},
		}),
});

export const persistor = persistStore(store);
