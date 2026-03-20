"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";

function DashboardContent() {
    const searchParams = useSearchParams();
    const externalSearch = searchParams.get('search');

    const { user } = useSelector((state) => state.auth);
    const [interns, setInterns] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [genderFilter, setGenderFilter] = useState("All");

    const router = useRouter();

    // Initialize searchTerm from URL on mount
    useEffect(() => {
        if (externalSearch) {
            setSearchTerm(externalSearch);
        }
    }, [externalSearch]);

    // Fetch Interns Data
    useEffect(() => {
        const deptId = user?.dept_id || user?.deptartment_id;
        if (deptId) {
            fetch(`/api/head/interns?deptId=${deptId}`)
                .then(res => res.json())
                .then(data => setInterns(data));
        }
    }, [user]);

    const filteredInterns = interns.filter((intern) => {
        const matchesSearch = 
            (intern.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
            (intern.college || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGender = genderFilter === "All" || intern.gender === genderFilter;
        return matchesSearch && matchesGender;
    });

    return (
        <div className="p-8 bg-[#0f172a] min-h-screen text-slate-200">
            <div className="max-w-6xl mx-auto">
                
                {/* Header Section */}
                <div className="mb-8 border-l-4 border-indigo-500 pl-4 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Department <span className="text-indigo-400">Interns</span>
                        </h1>
                        <p className="text-slate-400 mt-1">Real-time management for your assigned personnel.</p>
                    </div>
                    {searchTerm && (
                        <button 
                            onClick={() => {setSearchTerm(""); router.replace('/Head/dashboard')}}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-3 rounded-lg transition-colors border border-slate-700"
                        >
                            Clear Search ✕
                        </button>
                    )}
                </div>

                {/* Search & Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="md:col-span-3 relative">
                        <input 
                            type="text"
                            placeholder="Search by name or college..."
                            className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-4 pl-12 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-4 top-4 text-slate-500">🔍</span>
                    </div>
                    
                    <select 
                        className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 text-white focus:border-indigo-500 outline-none cursor-pointer hover:bg-[#334155] transition-colors"
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                    >
                        <option value="All">All Genders</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                
                {/* Table Container */}
                <div className="overflow-hidden bg-[#1e293b] rounded-2xl border border-slate-800 shadow-2xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#334155]/50 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-800">
                                <th className="px-6 py-5 font-semibold">Intern Details</th>
                                <th className="px-6 py-5 font-semibold">College</th>
                                <th className="px-6 py-5 font-semibold text-center">Gender</th>
                                <th className="px-6 py-5 font-semibold text-center">Action</th>
                                <th className="px-6 py-5 font-semibold text-center">Tasks Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredInterns.length > 0 ? (
                                filteredInterns.map(intern => (
                                    <tr key={intern.id} className="hover:bg-slate-800/50 transition-all group">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{intern.name}</div>
                                            <div className="text-sm text-slate-500">{intern.email}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-slate-300 text-sm italic">
                                                {intern.college || "Unspecified"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter border ${
                                                intern.gender === 'MALE' 
                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                                : intern.gender === 'FEMALE' 
                                                ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' 
                                                : 'bg-slate-700 text-slate-300 border-slate-600'
                                            }`}>
                                                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
                                                {intern.gender || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button 
                                                    onClick={() => router.push(`/${intern.id}/view`)} 
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[80px]"
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    onClick={() => router.push(`/Head/tasks?search=${encodeURIComponent(intern.name)}`)} 
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[100px]"
                                                >
                                                    Edit Task
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold text-sm">
                                                {intern.task_count || 0}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="text-slate-500 text-lg">No matches found for "<span className="text-indigo-400">{searchTerm}</span>"</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Stats */}
                <div className="mt-6 flex justify-between items-center text-sm text-slate-500 px-2">
                    <p>Showing {filteredInterns.length} out of {interns.length} interns</p>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400"></span> Male</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-pink-400"></span> Female</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HeadDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0f172a] text-white p-8">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}