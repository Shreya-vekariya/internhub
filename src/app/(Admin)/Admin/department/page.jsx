"use client";
import { useEffect, useState } from "react";
import { getDepartmentsList } from "../../../lib/useAdmin";
import Link from "next/link";

export default function DepartmentDashboard() {
	const [departments, setDepartments] = useState([]);
	const [searchTerm, setSearchTerm] = useState(""); // 1. Add Search State
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			const data = await getDepartmentsList();
			setDepartments(data);
			setLoading(false);
		};
		loadData();
	}, []);

	// 2. Filter Logic: Matches Name OR Head Name
	const filteredDepartments = departments.filter((dept) => {
		const s = searchTerm.toLowerCase();
		return (
			dept.name.toLowerCase().includes(s) ||
			dept.head_name.toLowerCase().includes(s)
		);
	});

	if (loading)
		return <div className="p-10 text-white">Loading Departments...</div>;

	return (
		<div className="p-6 bg-slate-950 min-h-screen text-white">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
				<div>
					<h2 className="text-2xl font-bold italic text-indigo-400">
						System Organization
					</h2>
					<h1 className="text-4xl font-extrabold tracking-tight">
						Departments
					</h1>
				</div>

				{/* 3. Search Input Field */}
				<div className="w-full md:w-72 relative">
					<input
						type="text"
						placeholder="Search departments or heads..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
					/>
					{searchTerm && (
						<button
							onClick={() => setSearchTerm("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
							✕
						</button>
					)}
				</div>

				<div className="text-right hidden md:block">
					<span className="text-slate-500 text-sm uppercase tracking-widest">
						Total Entities
					</span>
					<p className="text-2xl font-mono">{filteredDepartments.length}</p>
				</div>
			</div>

			{/* 4. Empty State Handling */}
			{filteredDepartments.length === 0 ? (
				<div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
					<p className="text-slate-500">
						No departments found matching &quot;{searchTerm}&quot;
					</p>
				</div>
			) : (
				/* Department Grid */
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredDepartments.map((dept) => (
						<div
							key={dept.id}
							className="group relative bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between">
							{/* Decorative Background ID */}
							<div className="absolute top-6 right-6 text-slate-800 group-hover:text-indigo-500/20 text-5xl font-black transition-colors pointer-events-none">
								{dept.id < 10 ? `0${dept.id}` : dept.id}
							</div>

							<div className="relative z-10">
								<h3 className="text-xl font-bold mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">
									{dept.name}
								</h3>
								<div className="flex items-center gap-2 mb-6">
									<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
									<span className="text-xs text-slate-400 uppercase tracking-tighter">
										Active Department
									</span>
								</div>

								{/* Head Info Box */}
								<div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 group-hover:border-slate-700 transition-colors">
									<p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
										Department Head
									</p>
									<div className="flex items-center gap-3">
										<div className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-inner">
											{dept.head_name.charAt(0)}
										</div>
										<p className="text-sm font-semibold text-slate-200 truncate">
											{dept.head_name}
										</p>
									</div>
								</div>
							</div>

							{/* NEW: Enhanced More Details Section */}
							<div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between relative z-10">
								<div className="flex flex-col">
									<span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
										Status
									</span>
									<span className="text-xs font-medium text-indigo-300">
										Verified
									</span>
								</div>

								<Link
									href={`/Admin/department/${dept.id}`}
									className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 group/btn">
									View Details
									<span className="transform group-hover/btn:translate-x-1 transition-transform">
										→
									</span>
								</Link>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}