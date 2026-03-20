"use client";
import { useSelector } from "react-redux";
import Navbar from "./navbar";

export default function NavbarWrapper() {
    // Access auth state from Redux
    const { isLoggedIn } = useSelector((state) => state.auth);

    // Only render the Navbar if user is logged in
    if (!isLoggedIn) {
        return null;
    }

    return <Navbar title="InternHub" />;
}