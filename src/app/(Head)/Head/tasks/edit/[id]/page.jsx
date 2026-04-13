"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { getTaskById, updateTask, getDeptInterns } from '../../../../../lib/useAdmin';

export default function EditTaskPage() {
    const router = useRouter();
    const { id } = useParams(); 
    const { user } = useSelector((state) => state.auth);

    const today = new Date().toISOString().split('T')[0];
    
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [errors, setErrors] = useState({}); // State for validation errors

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

    const validate = () => {
        let newErrors = {};
        
        // 1. Title Validation (Letters, numbers, and spaces only)
        const titleRegex = /^[a-zA-Z0-9 ]+$/;
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (!titleRegex.test(formData.title)) {
            newErrors.title = "Special characters are not allowed in title";
        }

        // 2. Assigned To Validation
        if (!formData.assigned_to) {
            newErrors.assigned_to = "Please select an intern";
        }

        // 3. Due Date Validation
        const selectedYear = new Date(formData.due_date).getFullYear();
        if (!formData.due_date) {
            newErrors.due_date = "Due date is required";
        } else if (formData.due_date < today) {
            newErrors.due_date = "Date cannot be in the past";
        } else if (selectedYear > 2099) {
            newErrors.due_date = "Please enter a valid year (before 2100)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return; // Stop if validation fails

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
            alert("Task updated successfully!");
            router.push('/Head/tasks');
        } catch (error) {
            console.error("Update error:", error);
            alert("Error: " + error.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-slate-900 text-center font-bold">Loading Task Details...</div>;

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => router.back()} className="text-slate-500 hover:text-teal-600 mb-4 flex items-center gap-2 transition-colors font-semibold">
                    ← Cancel Edit
                </button>
                
                <h1 className="text-3xl font-bold mb-6 text-slate-900">Edit Task</h1>
                
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
                            <input 
                                value={formData.title}
                                className={`w-full bg-white border border-slate-300 p-3 rounded-lg text-slate-900 shadow-sm focus:ring-2 focus:border-teal-500 outline-none transition-all ${errors.title ? 'border-red-500 focus:ring-red-500' : 'focus:ring-teal-500'}`}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                            <textarea 
                                value={formData.description}
                                className="w-full bg-white border border-slate-300 p-3 rounded-lg text-slate-900 shadow-sm h-24 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Describe the task details (Optional)..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Intern</label>
                                <select 
                                    value={formData.assigned_to}
                                    className={`w-full bg-white border border-slate-300 p-3 rounded-lg shadow-sm text-slate-900 focus:ring-2 focus:border-teal-500 outline-none transition-all ${errors.assigned_to ? 'border-red-500 focus:ring-red-500' : 'focus:ring-teal-500'}`}
                                    onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                                >
                                    <option value="">Select an Intern</option>
                                    {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                                {errors.assigned_to && <p className="text-red-500 text-xs mt-1">{errors.assigned_to}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                <select 
                                    value={formData.status}
                                    className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-lg outline-none shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                                <select 
                                    value={formData.priority}
                                    className="w-full bg-white border border-slate-300 text-slate-900 shadow-sm p-3 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                                <input 
                                    type="date"
                                    min={today}
                                    max="2099-12-31"
                                    value={formData.due_date}
                                    className={`w-full bg-white text-slate-900 border border-slate-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:border-teal-500 outline-none transition-all ${errors.due_date ? 'border-red-500 focus:ring-red-500' : 'focus:ring-teal-500'}`}
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                />
                                {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={updating}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-sm text-white ${
                                updating 
                                ? "bg-slate-300 text-slate-600 cursor-not-allowed" 
                                : "bg-teal-600 hover:bg-teal-700 active:scale-[0.98]"
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