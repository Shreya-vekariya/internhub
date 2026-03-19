"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export default function Home() {
    const { user, isLoggedIn } = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        // Redirect logic based on login status and role
        if (isLoggedIn && user) {
            const role = user.role?.toLowerCase();
            if (role === "admin") {
                router.replace("/Admin");
            } else if (role === "intern") {
                router.replace("/Intern");
            } else if (role === "head") {
                router.push("/Head");
            }
        } else {
            // If not logged in, force them to the login page
            router.replace("/Login");
        }
    }, [isLoggedIn, user, router]);

    // Show a sleek loading spinner while the redirect is happening
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                <p className="text-indigo-400 font-medium animate-pulse">Redirecting to Dashboard...</p>
            </div>
        </div>
    );
}