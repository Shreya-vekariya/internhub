"use client";
import React, { useState, useEffect, Suspense } from 'react'; // Added Suspense
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { useSelector } from 'react-redux';
import { getDepartmentTasks, deleteTask } from '../../../lib/useAdmin';

function TasksContent() { // Wrapped existing logic into a sub-component
    const router = useRouter();
    const searchParams = useSearchParams();
    const querySearch = searchParams.get('search') || ''; // Get name from URL

    const { user } = useSelector((state) => state.auth);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Set the search term if it exists in the URL
    useEffect(() => {
        if (querySearch) {
            setSearchTerm(querySearch);
        }
    }, [querySearch]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await getDepartmentTasks(user?.dept_id);
            if (data) setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.dept_id) fetchTasks();
    }, [user]);

    const handleDelete = async (taskId) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTask(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            alert("Could not delete task: " + error.message);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-900/30 text-green-400';
            case 'In Progress': return 'bg-yellow-900/30 text-yellow-400';
            case 'In Review': return 'bg-purple-900/30 text-purple-400';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Manage Tasks</h1>
                <button 
                    onClick={() => router.push('/Head/tasks/create')}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg active:scale-95"
                >
                    <span className="text-xl">+</span> Create New Task
                </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <input 
                    type="text"
                    placeholder="Search by intern name..."
                    className="bg-white border text-slate-900 border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-teal-500 min-w-[250px] shadow-sm placeholder-slate-400"
                    value={searchTerm} // Controlled input
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <select className="bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-teal-500 shadow-sm" onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                </select>

                <select className="bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-teal-500 shadow-sm" onChange={(e) => setPriorityFilter(e.target.value)}>
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Task Details</th>
                            <th className="px-6 py-4">Assigned To</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic">Loading tasks...</td></tr>
                        ) : (
                            tasks
                            .filter(task => {
                                const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
                                const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
                                const matchesSearch = (task.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
                                return matchesStatus && matchesPriority && matchesSearch;
                            })
                            .map((task) => (
                                <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{task.title}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{task.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-teal-50 flex items-center justify-center text-[10px] text-teal-600 border border-teal-200">
                                                {task.user?.name?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-sm text-slate-700">{task.user?.name || "Unassigned"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-700">{task.due_date || "No due date"}</span>
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
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-3">
                                            <button onClick={() => router.push(`/Head/tasks/edit/${task.id}`)} className="text-teal-600 hover:text-teal-800 transition-colors text-sm font-medium">Edit</button>
                                            <div className="w-[1px] h-4 bg-slate-200"></div>
                                            <button onClick={() => handleDelete(task.id)} className="text-rose-600 hover:text-rose-800 transition-colors text-sm font-medium">Delete</button>
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

// Main component with Suspense wrapper
export default function ManageTasks() {
    return (
        <Suspense fallback={<div className="p-8 text-white">Loading...</div>}>
            <TasksContent />
        </Suspense>
    );
}