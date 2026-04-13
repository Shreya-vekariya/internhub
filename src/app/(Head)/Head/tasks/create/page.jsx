"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { getDeptInterns, createTask } from '../../../../lib/useAdmin'; 

export default function CreateTaskPage() {
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);

    const today = new Date().toISOString().split('T')[0];
    
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Track errors for each specific field
    const [errors, setErrors] = useState({}); 

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'Medium',
        due_date: ''
    });

    useEffect(() => {
        const fetchInterns = async () => {
            try {
                const data = await getDeptInterns(user.dept_id);
                setInterns(data);
            } catch (error) {
                console.error("Fetch Error:", error);
            }
        };
        if (user?.dept_id) fetchInterns();
    }, [user]);

    const validate = () => {
        let newErrors = {};
        
        // 1. Title Validation (No special characters, letters/numbers only)
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

        // 3. Due Date Validation (Past dates + Extreme future dates)
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

        try {
            setLoading(true);
            const taskObject = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                due_date: formData.due_date,
                assigned_to: parseInt(formData.assigned_to),
                department_id: user.dept_id,
                status: "Pending"
            };

            await createTask(taskObject);
            alert("Task created successfully!");
            router.push('/Head/tasks');
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={() => router.back()}
                    className="text-slate-500 hover:text-teal-600 mb-4 flex items-center gap-2 transition-colors font-semibold"
                >
                    ← Back to Tasks
                </button>
                
                <h1 className="text-3xl font-bold mb-6 text-slate-900">Assign New Task</h1>
                
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
                            <input 
                                className={`w-full bg-white border border-slate-300 p-3 rounded-lg text-slate-900 shadow-sm focus:ring-2 focus:border-teal-500 outline-none transition-all ${errors.title ? 'border-red-500 focus:ring-red-500' : 'focus:ring-teal-500'}`}
                                placeholder="e.g. Monthly Data Cleanup"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                            <textarea 
                                className="w-full bg-white border border-slate-300 p-3 rounded-lg text-slate-900 shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all h-24"
                                placeholder="Describe the task details (Optional)..."
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Assign To Intern</label>
                                <select 
                                    className={`w-full bg-white border border-slate-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:border-teal-500 outline-none transition-all text-slate-900 ${errors.assigned_to ? 'border-red-500 focus:ring-red-500' : 'focus:ring-teal-500'}`}
                                    onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                                >
                                    <option value="">Select an Intern</option>
                                    {interns.map(i => (
                                        <option key={i.id} value={i.id}>{i.name}</option>
                                    ))}
                                </select>
                                {errors.assigned_to && <p className="text-red-500 text-xs mt-1">{errors.assigned_to}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Priority Level</label>
                                <select 
                                    className="w-full bg-white border border-slate-300 p-3 rounded-lg text-slate-900 shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                                <input 
                                    type="date"
                                    min={today}
                                    max="2099-12-31" // Extra safeguard in UI
                                    className={`w-full bg-white border border-slate-300 p-3 rounded-lg text-slate-900 shadow-sm focus:ring-2 focus:border-teal-500 outline-none transition-all ${errors.due_date ? 'border-red-500 focus:ring-red-500' : 'focus:ring-teal-500'}`}
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                />
                                {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Department (Auto)</label>
                                <input 
                                    value={user?.department_name || user?.department?.name || ""} 
                                    disabled 
                                    className="w-full bg-slate-100 border border-slate-200 p-3 rounded-lg text-slate-500 cursor-not-allowed italic"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-sm text-white ${
                                loading 
                                ? "bg-slate-300 text-slate-600 cursor-not-allowed" 
                                : "bg-teal-600 hover:bg-teal-700 active:scale-[0.98]"
                            }`}
                        >
                            {loading ? "Creating Task..." : "Confirm & Assign Task"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}