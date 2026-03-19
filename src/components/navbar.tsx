"use client";
import React from "react";
import LogoutButton from "./logout";
import { useSelector } from "react-redux";
import { User } from "../../types/User";
import Link from "next/link"; // Added Link for SPA navigation

interface NavLink {
    label: string;
    href: string;
    roles?: ("Admin" | "Intern" | "Head")[];
}

interface NavbarProps {
    title: string;
    links?: NavLink[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
}

interface RootState {
    auth: AuthState;
}

// Default nav items
const NavItems: NavLink[] = [
    { label: "Dahboard", href: "/Intern", roles: ["Intern"] },
    { label: "Intern List", href: "/Directory", roles: ["Intern"] },
    { label: "Dahboard", href: "/Admin", roles: ["Admin"] },
	{ label: "Home", href: "/Head", roles: ["Head"] },
    { label: "Manage Tasks", href: "/Head/tasks", roles: ["Head"] },
    { label: "About us", href: "/About" },
];

const Navbar: React.FC<NavbarProps> = ({ title, links = NavItems }) => {
    const { user } = useSelector((state: RootState) => state.auth);

    // Filter links by role with case-insensitive check
    const filteredLinks = links.filter((link) => {
        if (!link.roles) return true;
        if (!user || !user.role) return false;
        
        // This ensures "admin" matches "Admin" or "ADMIN"
        return link.roles.some(
            (role) => role.toLowerCase() === user.role.toLowerCase()
        );
    });

    return (
        <nav className="text-white bg-black text-base p-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold mr-6">{title}</h1>
                    <ul className="flex space-x-4">
                        {filteredLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-white text-base hover:underline"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex items-center space-x-4">
                    {user && (
                        <span className="text-gray-400 text-sm italic">
                            ({user.role})
                        </span>
                    )}
                    <div className="mx-2">
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;