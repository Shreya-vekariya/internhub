"use client";

import { useEffect, useState } from "react";
import { userlist, deleteUser, getDepartments } from "../../lib/useAdmin"; 
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const router = useRouter();
    const currentUser = useSelector((state) => state.auth.user);

    useEffect(() => {
        const fetchData = async () => {
            const userData = await userlist();
            const deptData = await getDepartments(); 
            setUsers(userData);
            setDepartments(deptData);
        };
        fetchData();
    }, []);

    // Helper to get latest 3 users for "Recent Activity"
    const recentUsers = [...users].sort((a, b) => b.id - a.id).slice(0, 3);

    return (
        <div className="min-h-screen p-8 text-white bg-slate-950">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-slate-400 text-sm">System Operational • {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => router.push("/AddDepartment")}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                    >
                        <span className="text-lg">+</span> Department
                    </button>
                    <button
                        onClick={() => router.push("/AddUser")}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        <span className="text-lg">+</span> New User
                    </button>
                </div>
            </div>

            {/* Welcome Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 mb-10">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-500/20">
                        {currentUser?.name?.charAt(0) || "A"}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                Welcome back, {currentUser?.name || "Admin"}!
                            </h1>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 w-fit self-center">
                                {currentUser?.role || "System Admin"}
                            </span>
                        </div>
                        <p className="text-slate-400 max-w-xl">
                            Logged in as <span className="text-slate-200 font-medium">{currentUser?.email}</span>. 
                            Everything looks stable today.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <Link href="/Admin/users">
                    <StatCard title="Total Users" value={users.length} icon="👥" color="blue" />
                </Link>
                <Link href="/Admin/department">
                    <StatCard title="Active Depts" value={departments.length} icon="🏢" color="purple" />
                </Link>
                <StatCard title="Admin Staff" value={users.filter(u => u.role === "Admin").length} icon="🛡️" color="indigo" />
                <StatCard title="Dept Heads" value={users.filter(u => u.role === "Head").length} icon="🎓" color="amber" />
            </div>

            {/* --- NEW SECTIONS TO FILL SPACE --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Recent Activity / Latest Signups */}
                <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Recent Signups</h3>
                        <Link href="/Admin/users" className="text-indigo-400 text-sm hover:underline">View all</Link>
                    </div>
                    <div className="space-y-4">
                        {recentUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-700 text-slate-300">
                                    {user.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Quick Actions / System Status */}
                {/* <div className="space-y-6">
                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
                        <h3 className="text-lg font-bold mb-4 text-indigo-300">Quick Shortcuts</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => router.push('/Admin/users')} className="p-3 bg-slate-800 rounded-xl text-xs font-medium hover:bg-slate-700 transition-colors">Manage Users</button>
                            <button onClick={() => router.push('/Admin/department')} className="p-3 bg-slate-800 rounded-xl text-xs font-medium hover:bg-slate-700 transition-colors">Manage Depts</button>
                            <button onClick={() => router.push('/AddUser')} className="p-3 bg-slate-800 rounded-xl text-xs font-medium hover:bg-slate-700 transition-colors">Add Staff</button>
                            <button className="p-3 bg-slate-800 rounded-xl text-xs font-medium hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">Settings</button>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                        <h3 className="text-lg font-bold mb-4">Platform Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Database Load</span>
                                <span className="text-emerald-400 font-mono text-xs">Normal (12ms)</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div className="bg-indigo-500 h-1.5 rounded-full w-[35%]"></div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Storage Used</span>
                                <span className="text-slate-200 font-mono text-xs">2.4 GB / 10 GB</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div className="bg-purple-500 h-1.5 rounded-full w-[24%]"></div>
                            </div>
                        </div>
                    </div>
                </div> */}

            </div>
        </div>
    );
}

// Helper Components
function StatCard({ title, value, icon, color }) {
    const colors = {
        blue: "text-blue-400 bg-blue-400/10",
        purple: "text-purple-400 bg-purple-400/10",
        indigo: "text-indigo-400 bg-indigo-400/10",
        amber: "text-amber-400 bg-amber-400/10",
    };
    
    return (
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/50 hover:bg-slate-900 transition-all group cursor-pointer">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <h4 className="text-3xl font-bold mt-1 tracking-tight">{value}</h4>
        </div>
    );
}
