"use client";

import { useEffect, useState } from "react";
import {
    userlist,
    getDepartments,
    deleteUser,
} from "../../../lib/useAdmin";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [deptFilter, setDeptFilter] = useState("All");

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5; // Change this number to show more/less per page

    const router = useRouter();
    const currentUser = useSelector((state) => state.auth.user);

    const fetchData = async () => {
        const userData = await userlist();
        const deptData = await getDepartments();
        setUsers(userData);
        setDepartments(deptData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, deptFilter]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(id);
                setUsers(users.filter((u) => u.id !== id));
            } catch (error) {
                alert("Failed to delete user");
            }
        }
    };

    // 1. Filter the users
    const filteredUsers = users.filter((user) => {
        if (String(user.id) === String(currentUser?.id)) return false;

        const s = searchTerm.toLowerCase();
        const matchesSearch =
            (user.name || "").toLowerCase().includes(s) ||
            (user.college || "").toLowerCase().includes(s) ||
            (user.department_name || "").toLowerCase().includes(s);

        const matchesRole = roleFilter === "All" || user.role === roleFilter;
        const matchesDept =
            deptFilter === "All" ||
            String(user.department_id) === String(deptFilter);

        return matchesSearch && matchesRole && matchesDept;
    });

    // 2. Calculate indices for pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="min-h-screen bg-[#0a0a0c] p-4 md:p-10 text-slate-200">
            {/* --- HEADER SECTION --- (Unchanged) */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">User Management</h1>
                    <p className="text-slate-400 mt-1">Manage platform access and department roles.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push("/AddDepartment")} className="bg-transparent border border-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">+ Departments</button>
                    <button onClick={() => router.push("/AddUser")} className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all">+ Create User</button>
                </div>
            </div>

            {/* --- QUICK STATS --- (Unchanged) */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Total Active</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{users.length} Users</h3>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Filtered Result</p>
                    <h3 className="text-3xl font-bold text-indigo-400 mt-1">{filteredUsers.length}</h3>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Departments</p>
                    <h3 className="text-3xl font-bold text-emerald-400 mt-1">{departments.length}</h3>
                </div>
            </div>

            {/* --- FILTERS BAR --- (Unchanged) */}
            <div className="max-w-7xl mx-auto bg-slate-900/40 border border-slate-800 p-2 rounded-2xl mb-8 flex flex-col lg:flex-row gap-2">
                <div className="relative flex-grow">
                    <input type="text" placeholder="Search by name, college, or department..." className="w-full bg-transparent border-none px-5 py-3 outline-none text-white placeholder-slate-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2 p-1">
                    <select className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="All">All Roles</option>
                        <option value="Head">Heads</option>
                        <option value="Intern">Interns</option>
                    </select>
                    <select className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-w-[160px]" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                        <option value="All">All Departments</option>
                        {departments.map((dept) => (<option key={dept.id} value={String(dept.id)}>{dept.name}</option>))}
                    </select>
                </div>
            </div>

            {/* --- USER LIST --- */}
            <div className="max-w-7xl mx-auto">
                {currentUsers.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                        <p className="text-slate-500 italic text-lg">No users match your criteria.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4">
                            {currentUsers.map((user) => (
                                <div key={user.id} className="group flex flex-col lg:flex-row justify-between items-start lg:items-center bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 p-6 rounded-2xl transition-all duration-300 shadow-sm gap-6">
                                    <div className="flex items-center gap-5 min-w-[300px]">
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl uppercase shadow-inner">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{user.name}</h4>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${user.role === 'Admin' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : user.role === 'Head' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}`}>{user.role}</span>
                                            </div>
                                            <p className="text-slate-400 text-sm font-medium">{user.email}</p>
                                            <p className="text-slate-500 text-xs mt-0.5">{user.college || " "}</p>
                                        </div>
                                    </div>

                                    {user.role === "Intern" && (
                                        <div className="flex flex-wrap items-center gap-4 md:gap-8 flex-grow">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Status</span>
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold border w-fit uppercase ${user.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : user.status === 'ongoing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-700/30 text-slate-400 border-slate-600/30'}`}>{user.status || 'Pending'}</span>
                                            </div>
                                            <div className="flex gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Start Date</span>
                                                    <span className="text-sm text-slate-200 font-semibold bg-slate-800/50 px-2 py-1 rounded">{user.start_date ? new Date(user.start_date).toLocaleDateString() : '—'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">End Date</span>
                                                    <span className="text-sm text-slate-200 font-semibold bg-slate-800/50 px-2 py-1 rounded">{user.end_date ? new Date(user.end_date).toLocaleDateString() : '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 w-full lg:w-auto border-t lg:border-none border-slate-800 pt-4 lg:pt-0">
                                        <button onClick={() => router.push(`/${user.id}/view`)} className="flex-1 lg:flex-none bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700">View</button>
                                        <button onClick={() => router.push(`/${user.id}/edit`)} className="flex-1 lg:flex-none bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="flex-1 lg:flex-none bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- PAGINATION CONTROLS --- */}
                        <div className="mt-10 flex justify-center items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-all"
                            >
                                Previous
                            </button>
                            
                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border ${
                                            currentPage === i + 1 
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}