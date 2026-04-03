"use client";
import React, { useEffect, useState } from "react";

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    department_name: string;
    priority: string;
    due_date: string;
    intern_name: string;
}

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    
    // --- Filter States ---
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [deptFilter, setDeptFilter] = useState("All");

    useEffect(() => {
        fetch("/api/admin/tasks")
            .then((res) => res.json())
            .then((data) => {
                setTasks(data);
                setLoading(false);
            });
    }, []);

    const getPriorityStyle = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case "high": return "bg-red-500/10 text-red-400 border-red-500/20";
            case "medium": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-900/30 text-green-400';
            case 'In Progress': return 'bg-yellow-900/30 text-yellow-400';
            case 'In Review': return 'bg-purple-900/30 text-purple-400';
            case 'Pending': return 'bg-red-900/30 text-red-400';
            default: return 'bg-slate-700/50 text-slate-300';
        }
    };

    // --- Filter Logic ---
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             task.intern_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || task.status === statusFilter;
        const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
        const matchesDept = deptFilter === "All" || task.department_name === deptFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesDept;
    });

    // Get unique departments for the dropdown
    const uniqueDepartments = ["All", ...Array.from(new Set(tasks.map(t => t.department_name)))];

    return (
        <div className="p-8 bg-[#0f172a] min-h-screen text-white">
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight">
                    Global <span className="text-indigo-500">Task Board</span>
                </h1>
                <p className="text-slate-400 mt-2">Monitoring all active intern assignments across departments.</p>
            </header>

            {/* --- Filter Bar --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-[#1e293b] p-4 rounded-2xl border border-slate-800">
                <input 
                    type="text" 
                    placeholder="Search task or intern..." 
                    className="bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <select 
                    className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                >
                    <option value="All">All Departments</option>
                    {uniqueDepartments.filter(d => d !== "All").map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>

                <select 
                    className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>

                <select 
                    className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-slate-500 animate-pulse">Loading tasks...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map((task) => (
                        <div key={task.id} className="bg-[#1e293b] border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-600 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700">
                                        {task.department_name}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${getPriorityStyle(task.priority)}`}>
                                        {task.priority || "Low"}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold mb-2 text-indigo-100">{task.title}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2 mb-6 leading-relaxed">
                                    {task.description}
                                </p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Assigned to</span>
                                    <span className="font-semibold text-slate-200">{task.intern_name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Due Date</span>
                                    <span className="font-mono text-indigo-400">{task.due_date.split("T")[0] || "No Date"}</span>
                                </div>
                                <div className="mt-4 pt-2">
                                    <span className={`inline-block w-full text-center py-1.5 rounded-lg text-xs font-bold uppercase tracking-tighter ${getStatusStyle(task.status)}`}>
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredTasks.length === 0 && (
                <div className="text-center py-20 bg-[#1e293b] rounded-2xl border border-dashed border-slate-700">
                    <p className="text-slate-500">No tasks found matching these filters.</p>
                </div>
            )}
        </div>
    );
}