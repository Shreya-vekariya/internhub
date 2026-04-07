"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSingleUser } from "../../../lib/useAdmin";

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

    // Helper to make dates look professional
    const formatDate = (dateString) => {
        if (!dateString) return "Not Set";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <DetailItem label="Full Name" value={user.name} />
                    <DetailItem label="Email Address" value={user.email} />
                    <DetailItem label="Current Role" value={user.role} badge />
                    <DetailItem label="Department" value={user.department_name || "General"} />
                    <DetailItem label="Gender" value={user.gender || "Not Specified"} />
                    <DetailItem label="User ID" value={`#${user.id}`} />

                    {/* Intern Specific Section - Styled separately for clarity */}
                    {user.role === "Intern" && (
                        <div className="col-span-1 md:col-span-2 mt-4 p-5 bg-blue-900/10 border border-blue-800/30 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <h3 className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-2">Internship Information</h3>
                            </div>
                            <DetailItem label="College/Institution" value={user.college || "N/A"} />
                            <DetailItem 
                                label="Current Status" 
                                value={user.status || "pending"} 
                                statusBadge 
                            />
                            <DetailItem label="Start Date" value={formatDate(user.start_date)} />
                            <DetailItem label="End Date" value={formatDate(user.end_date)} />
                        </div>
                    )}
                </div>

                <div className="mt-10">
                    <button
                        onClick={() => router.push(`/Admin/users/${user.id}/edit`)}
                        className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
                    >
                        Edit This Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

// Updated Helper component to handle status colors
function DetailItem({ label, value, badge, statusBadge }) {
    // Logic for status colors (pending = yellow, ongoing = blue, completed = green)
    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        if (s === "completed") return "bg-green-900/30 text-green-400 border-green-800/50";
        if (s === "ongoing") return "bg-blue-900/30 text-blue-400 border-blue-800/50";
        return "bg-yellow-900/30 text-yellow-400 border-yellow-800/50";
    };

    return (
        <div className="flex flex-col">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
            {badge ? (
                <span className="w-fit bg-gray-800 text-gray-300 px-3 py-1 rounded-md text-xs font-bold border border-gray-700">
                    {value}
                </span>
            ) : statusBadge ? (
                <span className={`w-fit px-3 py-1 rounded-md text-xs font-bold border uppercase ${getStatusColor(value)}`}>
                    {value}
                </span>
            ) : (
                <p className="text-md text-gray-200 font-medium">{value}</p>
            )}
        </div>
    );
}