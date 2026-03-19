"use client";

import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { logout } from "../redux/authSclice";

export default function LogoutButton() {
	const dispatch = useDispatch();
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await signOut({ redirect: false });

			dispatch(logout());

			router.push("/Login");

			router.refresh();
		} catch (error) {
			console.error("Logout failed", error);
		}
	};

	return (
		<button
			onClick={handleLogout}
			className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all">
			Logout
		</button>
	);
}
