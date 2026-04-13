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
            case "high": return "bg-red-50 text-red-600 border-red-200";
            case "medium": return "bg-orange-50 text-orange-600 border-orange-200";
            default: return "bg-blue-50 text-blue-600 border-blue-200";
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-50 text-green-600 border border-green-200';
            case 'In Progress': return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
            case 'In Review': return 'bg-purple-50 text-purple-600 border border-purple-200';
            case 'Pending': return 'bg-red-50 text-red-600 border border-red-200';
            default: return 'bg-slate-100 text-slate-600 border border-slate-200';
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
        <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight">
                    Global <span className="text-teal-600">Task Board</span>
                </h1>
                <p className="text-slate-600 mt-2">Monitoring all active intern assignments across departments.</p>
            </header>

            {/* --- Filter Bar --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <input 
                    type="text" 
                    placeholder="Search task or intern..." 
                    className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm placeholder-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <select 
                    className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
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
                        <div key={task.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-600 rounded border border-slate-200">
                                        {task.department_name}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${getPriorityStyle(task.priority)}`}>
                                        {task.priority || "Low"}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold mb-2 text-slate-900">{task.title}</h3>
                                <p className="text-sm text-slate-600 line-clamp-2 mb-6 leading-relaxed">
                                    {task.description}
                                </p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Assigned to</span>
                                    <span className="font-semibold text-slate-700">{task.intern_name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Due Date</span>
                                    <span className="font-mono text-teal-600 font-bold">{task.due_date.split("T")[0] || "No Date"}</span>
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
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
                    <p className="text-slate-500">No tasks found matching these filters.</p>
                </div>
            )}
        </div>
    );
}