"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSingleUser, updateUser, getDepartments } from "../../../lib/useAdmin";

export default function EditUser() {
    const { id } = useParams();
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [dateError, setDateError] = useState(""); 
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        college: "",
        gender: "",
        department_id: "",
        start_date: "",
        end_date: "",
        status: ""
    });

    // Helper to format database dates (ISO) to YYYY-MM-DD for HTML inputs
    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split('T')[0];
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch user and departments in parallel
                const [user, depts] = await Promise.all([
                    getSingleUser(id),
                    getDepartments()
                ]);
                
                if (user) {
                    // PRE-FILLING ALL FIELDS FROM DATABASE
                    setFormData({
                        name: user.name || "",
                        email: user.email || "",
                        role: user.role || "",
                        college: user.college || "",
                        gender: user.gender || "",
                        department_id: user.department_id ? String(user.department_id) : "",
                        // Formats the dates so the browser can display them in the date picker
                        start_date: formatDateForInput(user.start_date),
                        end_date: formatDateForInput(user.end_date),
                        status: user.status || "pending"
                    });
                }
                setDepartments(depts);
            } catch (error) {
                console.error("Error loading user data:", error);
                alert("Failed to fetch user data. Check console for details.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // INSTANT DATE VALIDATION
    useEffect(() => {
        if (formData.role === "Intern" && formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const minEnd = new Date(start);
            minEnd.setMonth(minEnd.getMonth() + 3);

            if (end < minEnd) {
                setDateError("⚠️ Internship must be at least 3 months long.");
            } else {
                setDateError("");
            }
        } else {
            setDateError("");
        }
    }, [formData.start_date, formData.end_date, formData.role]);

    // NAME VALIDATION (No special characters)
    const handleNameChange = (e) => {
        const cleanedValue = e.target.value.replace(/[^a-zA-Z\s]/g, "");
        setFormData({ ...formData, name: cleanedValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (dateError) return;

        try {
            await updateUser(id, {
                ...formData,
                department_id: formData.department_id ? parseInt(formData.department_id) : null,
                college: formData.role === "Head" ? null : formData.college,
                // If fields are empty, send null to DB
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
            });
            alert("Profile updated successfully!");
            router.push("/Admin/users");
        } catch (error) {
            alert(error.message); 
        }
    };

    if (loading) return <div className="p-10 text-slate-900 text-center font-bold">Fetching Database Records...</div>;

    return (
        <div className="min-h-screen p-8 text-slate-900 flex justify-center items-start bg-slate-50">
            <div className="w-full max-w-3xl bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h1 className="text-3xl font-bold mb-8 text-teal-600 border-b border-slate-200 pb-4">Edit User Profile</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none shadow-sm text-slate-900"
                                value={formData.name}
                                onChange={handleNameChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none shadow-sm text-slate-900"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    {/* Role, Dept, Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                            <select
                                className="w-full bg-white border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm text-slate-900"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="Intern">Intern</option>
                                <option value="Head">Head</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                            <select
                                className="w-full bg-white border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm text-slate-900"
                                value={formData.department_id}
                                onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                            >
                                <option value="">Select Dept</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={String(dept.id)}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                            <select
                                className="w-full bg-white border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm text-slate-900"
                                value={formData.gender}
                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            >
                                <option value="MALE">MALE</option>
                                <option value="FEMALE">FEMALE</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                        </div>
                    </div>

                    {/* Intern Specific Fields */}
                    {formData.role === "Intern" && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">College</label>
                                <input
                                    type="text"
                                    className="w-full bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none shadow-sm text-slate-900"
                                    value={formData.college}
                                    onChange={(e) => setFormData({...formData, college: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none shadow-sm text-slate-900"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        className={`w-full bg-white border rounded-lg p-3 outline-none transition-all shadow-sm text-slate-900 ${dateError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'}`}
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                    />
                                    {dateError && <p className="text-red-500 text-xs mt-2 font-semibold italic">{dateError}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                <select
                                    className="w-full bg-white border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm text-slate-900"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-8 border-t border-slate-200 mt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg transition-colors font-medium shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!!dateError}
                            className={`px-8 py-3 rounded-lg font-bold shadow-sm transition-all ${dateError ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}