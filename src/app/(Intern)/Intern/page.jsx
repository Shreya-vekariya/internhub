"use client";
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSingleUser, updateProfile } from "../../lib/useAdmin";

export default function InternProfile() {
    const { user: authUser } = useSelector((state) => state.auth);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        college: "",
        gender: ""
    });

    const fetchProfile = async () => {
        if (authUser?.id) {
            try {
                const result = await getSingleUser(authUser.id);
                setUserData(result);
                setFormData({
                    name: result.name || "",
                    email: result.email || "",
                    college: result.college || "",
                    gender: result.gender || ""
                });
            } catch (error) {
                console.error("Profile fetch error:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => { fetchProfile(); }, [authUser]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(authUser.id, formData);
            await fetchProfile(); // Refresh data
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Update failed. Please try again.");
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-indigo-500 font-bold">LOADING...</div>;

    const finalUser = userData || authUser;

    return (
        <div className="min-h-screen bg-[#0f172a] p-6 lg:p-12 text-slate-200">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-end mb-10 border-l-4 border-indigo-500 pl-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">My <span className="text-indigo-400">Profile</span></h1>
                        <p className="text-slate-400 mt-2 italic">Personal and Academic details.</p>
                    </div>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Edit Profile
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-[#1e293b] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-700"></div>
                    <div className="px-8 pb-10">
                        <div className="relative -mt-16 mb-6">
                            <div className="h-32 w-32 rounded-2xl bg-[#0f172a] border-4 border-[#1e293b] flex items-center justify-center text-4xl font-bold text-indigo-400">
                                {finalUser?.name?.charAt(0)}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoField label="Full Name" value={finalUser?.name} />
                            <InfoField label="Email Address" value={finalUser?.email} />
                            <InfoField label="Role" value={finalUser?.role} isBadge />
                            <InfoField label="Gender" value={finalUser?.gender || "Not Set"} />
                            <InfoField label="College / Institution" value={finalUser?.college || "Not Specified"} />
                            <InfoField 
                                label="Department" 
                                value={finalUser?.department_name || finalUser?.department?.name || `Dept ID: ${finalUser?.deptartment_id || 'N/A'}`} 
                            />
                        </div>                       
                    </div>
                </div>
                <p className="mt-8 text-center text-slate-500 text-sm">
                    Something looks wrong? Contact your <span className="text-indigo-400 font-bold">Department Head</span> to update details.
                </p>

                {/* EDIT MODAL  */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-[#1e293b] border border-slate-700 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
                            <h2 className="text-2xl font-bold text-white mb-6">Update <span className="text-indigo-400">Information</span></h2>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <ModalInput label="Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
                                <ModalInput label="Email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
                                <ModalInput label="College" value={formData.college} onChange={(v) => setFormData({...formData, college: v})} />
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Gender</label>
                                    <select 
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper Components
function InfoField({ label, value, isBadge }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            {isBadge ? <span className="inline-block px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-sm">{value}</span> : <p className="text-xl font-semibold text-white">{value}</p>}
        </div>
    );
}

function ModalInput({ label, value, onChange }) {
    return (
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{label}</label>
            <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-all"
            />
        </div>
    );
}