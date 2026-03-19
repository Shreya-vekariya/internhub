import { setUser, logout } from "./authSclice";
import { getSession } from "next-auth/react";

export const loadUser = () => async (dispatch) => {
	try {
		const session = await getSession();

		if (!session?.user) {
			dispatch(logout());
			return;
		}

		dispatch(setUser(session.user));
	} catch (error) {
		console.error("Failed to load user:", error);
		dispatch(logout());
	}
};
