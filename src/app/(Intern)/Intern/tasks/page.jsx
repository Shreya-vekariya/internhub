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

    if (loading) return <div className="p-10 text-teal-500 text-center font-bold">LOADING TASKS...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8 text-slate-900">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 border-l-4 border-teal-500 pl-4">
                    <h1 className="text-4xl font-extrabold text-slate-900">My <span className="text-teal-600">Tasks</span></h1>
                    <p className="text-slate-600">Manage and update your active assignments.</p>
                </header>

                {tasks.length === 0 ? (
                    <div className="bg-white shadow-sm p-20 rounded-3xl text-center border border-slate-200">
                        <p className="text-slate-500 text-lg italic">No tasks assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-teal-300 shadow-sm">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {task.priority}
                                        </span>
                                        <span className="text-slate-500 text-xs font-mono">ID: #{task.id}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{task.title}</h3>
                                    <p className="text-slate-600 text-sm line-clamp-2">{task.description}</p>
                                </div>

                                <div className="flex flex-col md:items-end gap-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update Status</label>
                                    <select 
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                        className={`bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-bold outline-none focus:border-teal-500 transition-all ${
                                            task.status === 'Completed' ? 'text-green-600' : 
                                            task.status === 'In Progress' ? 'text-yellow-600' : 'text-slate-900'
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