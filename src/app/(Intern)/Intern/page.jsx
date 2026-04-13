"use client";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getSingleUser, updateProfile, updateProfilePassword } from "../../lib/useAdmin";

export default function InternProfile() {
    const { user: authUser } = useSelector((state) => state.auth);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [passData, setPassData] = useState({ 
        current: "", 
        new: "", 
        confirm: "" 
    });
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        college: "",
        gender: ""
    });

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passData.new !== passData.confirm) return alert("Passwords do not match");
        
        try {
    setLoading(true);
    console.log("Sending to server:", authUser.id);
    const response = await updateProfilePassword(authUser.id, passData.current, passData.new);
    console.log("Server response:", response);
    
} catch (err) {
    console.error("Caught error:", err);
    alert(err.message); 
}finally {
            setLoading(false);
            setIsChangingPass(false);
        }
    };

    // Helper to format dates (e.g., "Jan 01, 2024")
    const formatDate = (dateString) => {
        if (!dateString) return "Not Set";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

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
            await fetchProfile();
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Update failed. Please try again.");
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-teal-600 font-bold tracking-widest text-xl">LOADING...</div>;

    const finalUser = userData || authUser;

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-12 text-slate-900">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-end mb-10 border-l-4 border-teal-500 pl-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My <span className="text-teal-600">Profile</span></h1>
                        <p className="text-slate-600 mt-2 italic font-medium">Personal, Academic, and Internship details.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsChangingPass(true)}
                            className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-6 py-2 rounded-xl font-bold transition-all shadow-sm"
                        >
                            Change Password
                        </button>
                        <button onClick={() => setIsEditing(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-sm">Edit Profile</button>
                    </div>
                </div>

                {/* Profile Card */}
                {/* Profile Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                    
                    {/* LEFT SIDEBAR: Visual Identity */}
                    <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 p-8 flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="h-40 w-40 rounded-3xl bg-white border-[6px] border-white flex items-center justify-center text-5xl font-black text-teal-600 shadow-2xl overflow-hidden ring-1 ring-slate-200">
                                <div className="bg-gradient-to-br from-teal-50 to-slate-50 w-full h-full flex items-center justify-center">
                                    {finalUser?.name?.charAt(0)}
                                </div>
                            </div>
                            {/* Status dot */}
                            <div className={`absolute bottom-3 right-3 h-6 w-6 border-4 border-white rounded-full shadow-sm ${
                                finalUser?.status?.toLowerCase() === 'completed' 
                                ? 'bg-red-500 animate-none' 
                                : 'bg-emerald-500 animate-pulse'
                            }`}>     
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-slate-800 leading-tight">{finalUser?.name}</h2>
                        <span className="mt-2 px-3 py-1 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                            Verified {finalUser?.role}
                        </span>

                        <div className="mt-8 w-full space-y-4 pt-8 border-t border-slate-200">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Department</span>
                                <span className="text-slate-900 font-bold">{finalUser?.department_name || "Java"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Employee ID</span>
                                <span className="text-slate-900 font-bold font-mono">#INT-2026</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Information Grid */}
                    <div className="flex-1 p-8 lg:p-10 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {/* Using a revised InfoField with more visual weight */}
                            <InfoField label="Email Address" value={finalUser?.email} icon="📧" />
                            <InfoField label="Gender" value={finalUser?.gender || "Not Set"} icon="👤" />
                            <InfoField label="College / Institution" value={finalUser?.college || "Not Specified"} icon="🏫" className="md:col-span-2" />
                        </div>

                        {/* INTERNSHIP TIMELINE BLOCK */}
                        <div className="mt-12">
                            <div className="flex items-center gap-4 mb-6">
                                <h3 className="text-teal-600 font-black text-xs uppercase tracking-[0.2em]">Internship Timeline</h3>
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">🚀</div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Status</p>
                                    <div className={`text-sm font-black uppercase tracking-tight ${finalUser?.status === 'ONGOING' ? 'text-blue-600' : 'text-teal-600'}`}>
                                        {finalUser?.status || "Pending"}
                                    </div>
                                </div>

                                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Started On</p>
                                    <div className="text-sm font-black text-slate-800">{formatDate(finalUser?.start_date)}</div>
                                </div>

                                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Ending On</p>
                                    <div className="text-sm font-black text-slate-800">{formatDate(finalUser?.end_date)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-600 text-sm">
                    Is your status or timeline incorrect? Contact your <span className="text-teal-600 font-bold">Department Head</span> to request an update.
                </p>

                {/* EDIT MODAL */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-8 shadow-xl">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Update <span className="text-teal-600">Information</span></h2>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <ModalInput label="Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
                                <ModalInput label="Email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
                                <ModalInput label="College" value={formData.college} onChange={(v) => setFormData({...formData, college: v})} />
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Gender</label>
                                    <select 
                                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-teal-500 shadow-sm"
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
                                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold transition-all border border-slate-200">Cancel</button>
                                    <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isChangingPass && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-8 shadow-xl">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Change <span className="text-teal-600">Password</span></h2>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <ModalInput label="Current Password" type="password" value={passData.current} onChange={(v) => setPassData({...passData, current: v})} />
                                <ModalInput label="New Password" type="password" value={passData.new} onChange={(v) => setPassData({...passData, new: v})} />
                                <ModalInput label="Confirm New Password" type="password" value={passData.confirm} onChange={(v) => setPassData({...passData, confirm: v})} />
                                <div className="flex gap-4 mt-6">
                                    <button type="button" onClick={() => setIsChangingPass(false)} className="flex-1 text-slate-800 hover:bg-slate-100 rounded-xl py-3 border border-slate-200 font-medium transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold shadow-sm">Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Updated Helper Components
function InfoField({ label, value, icon, className = "" }) {
    return (
        <div className={`group ${className}`}>
            <div className="flex items-center gap-2 mb-1.5">
                {icon && <span className="text-base">{icon}</span>}
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-teal-500 transition-colors">
                    {label}
                </p>
            </div>
            <p className="text-lg font-bold text-slate-800 pl-0 md:pl-6 border-l-2 border-transparent group-hover:border-teal-200 transition-all">
                {value || "—"}
            </p>
        </div>
    );
}

function ModalInput({ label, value, onChange, type = "text" }) {
    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        // Updated to Red for Completed
        if (s === "completed") return "bg-red-50 text-red-600 border-red-200";
        if (s === "ongoing") return "bg-blue-50 text-blue-600 border-blue-200";
        return "bg-amber-50 text-amber-600 border-amber-200";
    };
    return (
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                {label}
            </label>
            <input 
                type={type} 
                value={value} 
                onChange={(e) => onChange(e.target.value)} // Ensure target.value is passed
                className="w-full bg-white shadow-sm border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-teal-500"
            />
        </div>
    );
}

