"use client";
import Link from 'next/link';
import React from 'react';

const About = () => {
    // Replaced generic blog with Portal Guides based on your user roles
    const portalGuides = [
        { id: 1, title: "For Admins", desc: "Manage user roles, departments, and system-wide data integrity.", icon: "🛡️" },
        { id: 2, title: "For Dept Heads", desc: "Monitor intern progress and filter department-specific personnel.", icon: "👨‍💼" },
        { id: 3, title: "For Interns", desc: "View and update your profile details.", icon: "🎓" },
        { id: 4, title: "Data Security", desc: "Powered by Hasura GraphQL with role-based access control.", icon: "🔒" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 lg:p-16">
            <div className="max-w-6xl mx-auto">
                
                {/* --- PORTAL MISSION SECTION --- */}
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-teal-50 border border-teal-200 text-teal-600 text-sm font-bold tracking-widest uppercase">
                        Management System v1.0
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        About Our <span className="text-teal-600">Portal</span>
                    </h1>
                    <p className="max-w-2xl text-lg text-slate-600 leading-relaxed">
                        Our platform is designed to bridge the gap between <span className="text-slate-900 font-semibold">Institutional Education</span> and 
                        <span className="text-slate-900 font-semibold"> Professional Internships</span>. We provide a centralized space for tracking 
                        growth, managing departments, and maintaining accurate user profiles.
                    </p>
                    <div className="flex space-x-4 mt-8">
                        <button className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-sm">
                            System Docs
                        </button>
                        <button className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-all border border-slate-200">
                            Support
                        </button>
                    </div>
                </div>

                {/* --- SYSTEM CAPABILITIES SECTION --- */}
                <div className="mb-10 border-l-4 border-teal-500 pl-4">
                    <h2 className="text-2xl font-bold text-slate-900">Portal Capabilities</h2>
                    <p className="text-slate-500 text-sm">Everything you need to manage your organizational workflow.</p>
                </div>

                

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {portalGuides.map((guide) => (
                        <div 
                            key={guide.id} 
                            className="group flex flex-col p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-400 transition-all duration-300 hover:shadow-md"
                        >
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                {guide.icon}
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors mb-2">
                                {guide.title}
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {guide.desc}
                            </p>
                            
                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Status: <span className="text-green-600 ml-2">Active</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- TECH STACK BADGE --- */}
                <div className="mt-20 p-8 rounded-3xl bg-slate-100 border border-slate-200 flex flex-col items-center text-center">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">Built With Modern Tech</h3>
                    <div className="flex flex-wrap justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-slate-900 font-bold text-xl">Next.js</span>
                        <span className="text-slate-900 font-bold text-xl">Hasura</span>
                        <span className="text-slate-900 font-bold text-xl">GraphQL</span>
                        <span className="text-slate-900 font-bold text-xl">Tailwind</span>
                        <span className="text-slate-900 font-bold text-xl">Redux</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;