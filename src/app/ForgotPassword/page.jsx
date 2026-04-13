"use client";
import { useState } from "react";
import { updatePasswordByEmail } from "../lib/useAdmin";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });
        
        try {
            // The server action handles validation, DB update, and mailing
            const result = await updatePasswordByEmail(email);
            
            if (result.success) {
                setStatus({ type: "success", message: result.message });
            } else {
                setStatus({ type: "error", message: result.message });
            }
        } catch (err) {
            setStatus({ type: "error", message: "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 w-full max-w-md shadow-md">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset <span className="text-teal-600">Password</span></h2>
                <p className="text-slate-600 text-sm mb-6">Enter your email to receive a temporary password.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Enter your registered email" 
                        required
                        disabled={loading}
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-teal-500 transition-all disabled:opacity-50 placeholder-slate-400"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm disabled:bg-slate-300"
                    >
                        {loading ? "Processing..." : "Send Password"}
                    </button>
                </form>

                {status.message && (
                    <p className={`mt-6 p-3 rounded-lg text-sm text-center font-medium ${
                        status.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                        {status.message}
                    </p>
                )}
                
                <div className="mt-6 text-center">
                    <a href="/login" className="text-slate-600 hover:text-teal-600 text-sm transition-colors">
                        ← Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
}