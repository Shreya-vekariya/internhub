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
			className="px-3 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-full hover:bg-red-600 transition-all shadow-sm">
			Logout
		</button>
	);
}
