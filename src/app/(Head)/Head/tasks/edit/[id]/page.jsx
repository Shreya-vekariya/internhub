"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { getTaskById, updateTask, getDeptInterns } from '../../../../../lib/useAdmin';

export default function EditTaskPage() {
    const router = useRouter();
    const { id } = useParams(); // Gets the task ID from the URL
    const { user } = useSelector((state) => state.auth);
    
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        priority: '',
        due_date: '',
        status: ''
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Task Details and Interns simultaneously
                const [taskData, internsList] = await Promise.all([
                    getTaskById(id),
                    getDeptInterns(user.dept_id)
                ]);

                if (taskData) {
                    setFormData({
                        title: taskData.title,
                        description: taskData.description || '',
                        assigned_to: taskData.assigned_to,
                        priority: taskData.priority,
                        due_date: taskData.due_date,
                        status: taskData.status
                    });
                }
                setInterns(internsList || []);
            } catch (error) {
                console.error("Error loading edit data:", error);
                alert("Failed to load task details.");
            } finally {
                setLoading(false);
            }
        };

        if (user?.dept_id && id) loadData();
    }, [user, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);

        const updatePayload = {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            due_date: formData.due_date,
            assigned_to: parseInt(formData.assigned_to),
            status: formData.status
        };

        try {
            await updateTask(id, updatePayload);
            router.push('/Head/tasks');
        } catch (error) {
            console.error("Update error:", error);
            alert("Error: " + error.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading Task Details...</div>;

    return (
        <div className="p-8 bg-[#0f172a] min-h-screen text-white">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => router.back()} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2">
                    ← Cancel Edit
                </button>
                
                <h1 className="text-3xl font-bold mb-6">Edit Task</h1>
                
                <div className="bg-[#1e293b] p-8 rounded-2xl border border-slate-700 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Task Title</label>
                            <input 
                                value={formData.title}
                                className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg outline-none"
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                            <textarea 
                                value={formData.description}
                                className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg h-24 outline-none"
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Assigned Intern</label>
                                <select 
                                    value={formData.assigned_to}
                                    className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg"
                                    onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                                    required
                                >
                                    {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                                <select 
                                    value={formData.status}
                                    className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg"
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="In Review">In Review</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
                                <select 
                                    value={formData.priority}
                                    className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg"
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
                                <input 
                                    type="date"
                                    value={formData.due_date}
                                    className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg"
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={updating}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                                updating ? "bg-slate-700" : "bg-blue-600 hover:bg-blue-500"
                            }`}
                        >
                            {updating ? "Updating..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}