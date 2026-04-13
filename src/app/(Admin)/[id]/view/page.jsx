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

    if (loading) return <div className="p-10 text-slate-900 text-center">Loading user details...</div>;
    if (!user) return <div className="p-10 text-slate-900 text-center">User not found.</div>;

    return (
        <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex justify-center items-start">
            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                    <h1 className="text-2xl font-bold text-teal-600">User Profile Details</h1>
                    <button 
                        onClick={() => router.back()}
                        className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition"
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
                        <div className="col-span-1 md:col-span-2 mt-4 p-5 bg-teal-50 border border-teal-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <h3 className="text-teal-700 font-bold text-sm uppercase tracking-widest mb-2">Internship Information</h3>
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
                        onClick={() => router.push(`/${user.id}/edit`)}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm"
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
        if (s === "completed") return "bg-green-50 text-green-600 border-green-200";
        if (s === "ongoing") return "bg-teal-50 text-teal-600 border-teal-200";
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
    };

    return (
        <div className="flex flex-col">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            {badge ? (
                <span className="w-fit bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-bold border border-slate-200">
                    {value}
                </span>
            ) : statusBadge ? (
                <span className={`w-fit px-3 py-1 rounded-md text-xs font-bold border uppercase ${getStatusColor(value)}`}>
                    {value}
                </span>
            ) : (
                <p className="text-md text-slate-900 font-bold">{value}</p>
            )}
        </div>
    );
}