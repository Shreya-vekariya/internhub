"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function CreateTaskPage() {
    
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);
    console.log("Current User from Redux:", user);
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'Medium',
        due_date: ''
    });

    // 1. Fetch interns in the Head's department
    useEffect(() => {
        const fetchInterns = async () => {
            //console.log("Fetching interns for dept:", user.deptartment_id); // This should show in browser
            try {
                const res = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action: 'FETCH_INTERNS', 
                        deptId: user.deptartment_id 
                    }),
                });
                const result = await res.json();
                console.log("API Result:", result); 
                
                // Set the interns state
                setInterns(result || []); 
            } catch (error) {
                console.error("Fetch Error:", error);
            }
        };

        if (user?.deptartment_id) {
            fetchInterns();
        } else {
            console.log("No Dept ID found, skipping fetch.");
        }
    }, [user]);

    console.log(interns)

    // 2. Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const taskPayload = {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            due_date: formData.due_date,
            assigned_to: parseInt(formData.assigned_to), 
            department_id: user.deptartment_id, 
            department_name: user.department_name || user.department?.name, 
            created_by: user.id,
            status: "Pending"
        };

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'CREATE', taskData: taskPayload }),
            });

            if (res.ok) {
                router.push('/Head/tasks'); 
            } else {
                const err = await res.json();
                alert("Error: " + (err.message || "Failed to create task"));
            }
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-[#0f172a] min-h-screen text-white">
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={() => router.back()}
                    className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
                >
                    ← Back to Tasks
                </button>
                
                <h1 className="text-3xl font-bold mb-6 text-white">Assign New Task</h1>
                
                <div className="bg-[#1e293b] p-8 rounded-2xl border border-slate-700 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Task Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Task Title</label>
                            <input 
                                className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="e.g. Monthly Data Cleanup"
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                            <textarea 
                                className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24"
                                placeholder="Describe the task details..."
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Intern Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Assign To Intern</label>
                                <select 
                                    className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                                    required
                                >
                                    <option value="">Select an Intern</option>
                                    {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Priority Level</label>
                                <select 
                                    className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                            {/* Due Date */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
                                <input 
                                    type="date"
                                    className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all color-scheme-dark"
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    required
                                />
                            </div>

                            {/* Automatic Dept (Disabled) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Department (Auto)</label>
                                <input 
                                    value={user?.department_name || user?.department?.name || ""} 
                                    disabled 
                                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-slate-500 cursor-not-allowed italic"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                                loading 
                                ? "bg-slate-700 cursor-not-allowed" 
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]"
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