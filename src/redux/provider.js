"use client";

import { Provider, useDispatch } from "react-redux";
import { persistor, store } from "./store";
import { useEffect } from "react";

import { PersistGate } from "redux-persist/integration/react";



export default function ReduxProvider({ children }) {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				{children}
			</PersistGate>
		</Provider>
	);
}
