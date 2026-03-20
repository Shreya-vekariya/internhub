"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getInternTasks, updateTaskStatus } from '../../../lib/useAdmin';

export default function MyTasks() {
    const { user } = useSelector((state) => state.auth);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        if (user?.id) {
            try {
                const data = await getInternTasks(user.id);
                setTasks(data || []);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => { fetchTasks(); }, [user]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus);
            // Update local state to reflect change immediately
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (error) {
            alert("Failed to update status.");
        }
    };

    if (loading) return <div className="p-10 text-indigo-500 text-center font-bold">LOADING TASKS...</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-slate-200">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 border-l-4 border-indigo-500 pl-4">
                    <h1 className="text-4xl font-extrabold text-white">My <span className="text-indigo-400">Tasks</span></h1>
                    <p className="text-slate-400">Manage and update your active assignments.</p>
                </header>

                {tasks.length === 0 ? (
                    <div className="bg-[#1e293b] p-20 rounded-3xl text-center border border-slate-800">
                        <p className="text-slate-500 text-lg italic">No tasks assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-slate-600">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            task.priority === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                                        }`}>
                                            {task.priority}
                                        </span>
                                        <span className="text-slate-500 text-xs font-mono">ID: #{task.id}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">{task.title}</h3>
                                    <p className="text-slate-400 text-sm line-clamp-2">{task.description}</p>
                                </div>

                                <div className="flex flex-col md:items-end gap-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update Status</label>
                                    <select 
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                        className={`bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-sm font-bold outline-none focus:border-indigo-500 transition-all ${
                                            task.status === 'Completed' ? 'text-green-400' : 
                                            task.status === 'In Progress' ? 'text-yellow-400' : 'text-slate-300'
                                        }`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="In Review">In Review</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Due: {task.due_date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}