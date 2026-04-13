"use client";
import React, { useEffect, useState } from 'react';

export default function InternDirectory() {
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Inside InternDirectory (page.jsx)
    useEffect(() => {
    fetch('/api/interns/all') 
        .then(res => res.json())
        .then(data => {
            // Check if data is actually the array of users
            if (Array.isArray(data)) {
                setInterns(data);
            } else {
                // If Hasura returns an error object, we handle it here
                console.error("API Error:", data.error);
                setInterns([]); 
            }
            setLoading(false);
        })
        .catch(err => {
            console.error("Fetch Error:", err);
            setInterns([]);
            setLoading(false);
        });
}, []);

    // Add a safety check here
    const filteredInterns = Array.isArray(interns) 
        ? interns.filter(i => 
            i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.department?.name?.toLowerCase().includes(searchTerm.toLocaleLowerCase())
        )
        : [];

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-teal-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-8 text-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 border-l-4 border-teal-500 pl-4">
                    <h1 className="text-3xl font-bold text-slate-900">Intern <span className="text-teal-600">Community</span></h1>
                    <p className="text-slate-600">Network with peers across all departments.</p>
                </div>

                {/* Search Bar */}
                <div className="mb-8 relative">
                    <input 
                        type="text"
                        placeholder="Search by name, college, or department..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-4 pl-12 text-slate-900 focus:border-teal-500 outline-none transition-all placeholder-slate-400 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-4 top-4 text-slate-400">🔍</span>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInterns.map((intern) => (
                        <div key={intern.id} className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl hover:border-teal-300 transition-all group relative overflow-hidden">
                            
                            {/* Gender Tag in Top Right */}
                            <div className="absolute top-4 right-4">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                                    intern.gender?.toLowerCase() === 'male' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
                                    intern.gender?.toLowerCase() === 'female' ? 'bg-pink-50 text-pink-600 border border-pink-200' : 
                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                    {intern.gender || "N/A"}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-14 w-14 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-xl font-bold text-teal-600">
                                    {intern.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-slate-900 font-bold text-lg leading-tight">{intern.name}</h3>
                                    <p className="text-teal-600 text-xs font-semibold uppercase tracking-wider">{intern.college || "Independent"}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                {/* Department Info */}
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 text-xs font-bold uppercase w-12">Dept:</span>
                                    <span className="text-slate-700 text-sm font-medium">
                                        {intern.department_name || intern.department?.name || "General"}
                                    </span>
                                </div>

                                {/* Email Info */}
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 text-xs font-bold uppercase w-12">Email:</span>
                                    <span className="text-slate-700 text-sm truncate">{intern.email}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}