"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function ManageTasks() {
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch tasks on component mount
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'FETCH', 
                    deptId: user?.deptartment_id // Using your DB typo 'deptartment_id'
                }),
            });
            const result = await response.json();
            if (result) {
                setTasks(result);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.deptartment_id) {
            fetchTasks();
        }
    }, [user]);

    // 2. Delete Task Function
    const handleDelete = async (taskId) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'DELETE', 
                    taskId: taskId 
                }),
            });
            if (response.ok) {
                // Remove from local state to update UI immediately
                setTasks(tasks.filter(t => t.id !== taskId));
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // Helper for Status colors
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-900/30 text-green-400';
            case 'In Progress': return 'bg-yellow-900/30 text-yellow-400';
            case 'In Review': return 'bg-purple-900/30 text-purple-400';
            default: return 'bg-slate-700/50 text-slate-300';
        }
    };

    return (
        <div className="p-8 bg-[#0f172a] min-h-screen text-white font-sans">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manage Tasks</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Department: <span className="text-blue-400 font-medium uppercase">{user?.department_name || "Unassigned"}</span>
                    </p>
                </div>
                
                <button 
                    onClick={() => router.push('/Head/tasks/create')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg active:scale-95"
                >
                    <span className="text-xl">+</span> Create New Task
                </button>
            </div>

            {/* The Tasks Table */}
            <div className="bg-[#1e293b] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0f172a]/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4">Task Details</th>
                            <th className="px-6 py-4">Assigned To</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic">Loading tasks...</td>
                            </tr>
                        ) : tasks.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-slate-500">No tasks found for your department.</td>
                            </tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-slate-800/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-200">{task.title}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{task.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 border border-indigo-500/30">
                                                {task.user?.name?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-sm text-slate-300">{task.user?.name || "Unassigned"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wide ${
                                            task.priority === 'High' ? 'bg-red-900/30 text-red-400 border border-red-500/20' : 
                                            task.priority === 'Medium' ? 'bg-orange-900/30 text-orange-400 border border-orange-500/20' : 
                                            'bg-blue-900/30 text-blue-400 border border-blue-500/20'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-medium ${getStatusStyle(task.status)}`}>
                                            • {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-3">
                                            <button 
                                                onClick={() => router.push(`/Head/tasks/edit/${task.id}`)}
                                                className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <div className="w-[1px] h-4 bg-slate-700"></div>
                                            <button 
                                                onClick={() => handleDelete(task.id)}
                                                className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}