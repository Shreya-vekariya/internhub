"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const IdDept = () => {
	const { id } = useParams();
	const router = useRouter();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(`/api/head/departmentdetails/${id}`);
				if (!response.ok) throw new Error(`Error: ${response.status}`);
				const result = await response.json();
				setData(result);
				console.log("Result:",result);
			} catch (error) {
				console.error("Fetch error:", error.message);
			} finally {
				setLoading(false);
			}
		};
		if (id) fetchData();
	}, [id]);

	if (loading)
		return (
			<div className="p-10 text-slate-900 animate-pulse">
				Loading Department Details...
			</div>
		);
	if (!data?.departments_by_pk)
		return <div className="p-10 text-red-400">Department not found.</div>;

	const dept = data.departments_by_pk;
	const users = data.users || [];

	// Simple Stats Logic
	const maleCount = users.filter((u) => u.gender === "MALE").length;
	const femaleCount = users.filter((u) => u.gender === "FEMALE").length;

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12">
			{/* Header / Breadcrumb */}
			<button
				onClick={() => router.back()}
				className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors mb-6 text-sm font-medium">
				← Back to Dashboard
			</button>

			{/* Department Hero Section */}
			<div className="bg-white border border-slate-200 rounded-3xl p-8 mb-8 shadow-sm relative overflow-hidden">
				<div className="absolute top-0 right-0 p-8 text-slate-100 font-black text-7xl opacity-50 pointer-events-none">
					{dept.id}
				</div>

				<div className="relative z-10">
					<span className="bg-teal-50 text-teal-600 text-xs font-bold px-3 py-1 rounded-full border border-teal-200 uppercase tracking-widest">
						Department
					</span>
					<h1 className="text-5xl font-extrabold text-slate-900 mt-4 mb-2 tracking-tight">
						{dept.name}
					</h1>
					<div className="flex flex-wrap gap-6 mt-6">
						<StatItem label="Total Staff" value={users.length} />
						<StatItem label="Male" value={maleCount} color="text-blue-600" />
						<StatItem
							label="Female"
							value={femaleCount}
							color="text-pink-600"
						/>
					</div>
				</div>
			</div>

			{/* Users List Section */}
			<div className="space-y-4">
				<div className="flex justify-between items-center px-2">
					<h2 className="text-xl font-bold text-slate-900">Team Members</h2>
					<span className="text-sm text-slate-500">
						{users.length} active profiles
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{users.map((user) => (
						<div
							key={user.id}
							className="bg-white border border-slate-200 hover:border-teal-300 p-5 rounded-2xl transition-all shadow-sm flex flex-col justify-between group">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-4">
									<div
										className={`w-12 h-12 border rounded-full flex items-center justify-center text-lg font-bold ${
											user.gender === "MALE"
												? "bg-blue-50 text-blue-600 border-blue-200"
												: "bg-pink-50 text-pink-600 border-pink-200"
										}`}>
										{user.name.charAt(0)}
									</div>
									<div>
										<h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
											{user.name}
										</h3>
										<p className="text-xs text-slate-500">{user.email}</p>
									</div>
								</div>
								<Link href={`/${user.id}/edit`}>
									<span
										className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
											user.role === "Head"
												? "border-amber-200 text-amber-600 bg-amber-50"
												: "border-slate-200 text-slate-500 bg-slate-50"
										}`}>
										{user.role}
									</span>
								</Link>
							</div>

							<div className="mt-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter text-slate-600">
								<span>
									Gender:{" "}
									<span
										className={
											user.gender === "MALE" ? "text-blue-600 bg-blue-50 px-1 rounded" : "text-pink-600 bg-pink-50 px-1 rounded"
										}>
										{user.gender}
									</span>
								</span>
								<span>ID: #{user.id}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};


const StatItem = ({ label, value, color = "text-teal-600" }) => (
	<div className="flex flex-col border-l-2 border-slate-200 pl-4">
		<span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
			{label}
		</span>
		<span className={`text-2xl font-mono font-bold ${color}`}>{value}</span>
	</div>
);

export default IdDept;