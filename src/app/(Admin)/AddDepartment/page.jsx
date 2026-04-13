"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDepartment } from "../../lib/useAdmin"; // Path fix

export default function AddDepartment() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDepartment(name);
            alert("Department created! Now assign a Head via the User Edit screen.");
            router.push("/Admin");
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex justify-center items-start">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h1 className="text-2xl font-bold mb-6 text-teal-600">Create Department</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Department Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Finance"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => router.back()} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm rounded-lg font-bold">
                            {loading ? "Saving..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}