"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSingleUser } from "../../../lib/useAdmin"; // Ensure correct path

export default function ViewUser() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getSingleUser(id);
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [id]);

    if (loading) return <div className="p-10 text-white text-center">Loading user details...</div>;
    if (!user) return <div className="p-10 text-white text-center">User not found.</div>;

    return (
        <div className="min-h-screen p-8 bg-black text-white flex justify-center items-start">
            <div className="w-full max-w-2xl bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                    <h1 className="text-2xl font-bold text-blue-400">User Profile Details</h1>
                    <button 
                        onClick={() => router.back()}
                        className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
                    >
                        Back
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem label="Full Name" value={user.name} />
                    <DetailItem label="Email Address" value={user.email} />
                    <DetailItem label="Current Role" value={user.role} badge />
                    <DetailItem label="Department" value={user.department_name} />
                    <DetailItem label="Gender" value={user.gender || "Not Specified"} />
                    {user.role !== "Head" && (
                        <DetailItem label="College/Institution" value={user.college || "N/A"} />
                    )}
                    <DetailItem label="User ID" value={user.id} />
                </div>

                <div className="mt-8 flex gap-4">
                    <button
                        onClick={() => router.push(`/${user.id}/edit`)}
                        className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition"
                    >
                        Edit This Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper component for layout
function DetailItem({ label, value, badge }) {
    return (
        <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            {badge ? (
                <span className="inline-block bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-sm font-bold border border-blue-800/50">
                    {value}
                </span>
            ) : (
                <p className="text-lg text-gray-200">{value}</p>
            )}
        </div>
    );
}