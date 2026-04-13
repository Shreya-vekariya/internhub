"use client";
 
import { Chart, registerables } from "chart.js";
import { useState, useEffect, useRef } from "react";
 
// Register Chart.js components
if (typeof window !== "undefined") {
    Chart.register(...registerables);
}
const AskAi = () => {
    const [query, setQuery] = useState("");
        const [loading, setLoading] = useState(false);
        const [sql, setSql] = useState("");
        const [results, setResults] = useState([]);
        const [columns, setColumns] = useState([]);
        const [error, setError] = useState("");
        const [showResults, setShowResults] = useState(false);
 
        const chartRef = useRef(null);
        const chartInstance = useRef(null);
 
        const API_URL = "http://localhost:8000/api/v0/ask";
 
        const performQuery = async () => {
            if (!query.trim()) return;
 
            // Reset UI State
            setError("");
            setLoading(true);
            setShowResults(false);
 
            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question: query }),
                });
 
                const data = await response.json();
 
                if (!response.ok) throw new Error(data.detail || "Query failed");
 
                setSql(data.sql);
                setColumns(data.columns);
                setResults(data.results);
                setShowResults(true);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
 
        // Logic for Rendering Chart whenever results change
        useEffect(() => {
            if (showResults && results.length >= 2) {
                renderChart(columns, results);
            }
        }, [results, columns, showResults]);

        // Cleanup chart on unmount
        useEffect(() => {
            return () => {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }
            };
        }, []);
 
        const renderChart = (cols, rows) => {
            const numericCols = cols.filter((col) => {
                return (
                    rows.length > 0 &&
                    !isNaN(parseFloat(rows[0][col])) &&
                    isFinite(rows[0][col])
                );
            });
 
            const labelCol =
                cols.find((col) => !numericCols.includes(col)) || cols[0];
 
            if (numericCols.length === 0) return;
 
            if (!chartRef.current) return;

            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
 
            const datasets = numericCols.map((col, idx) => ({
                label: col.replace(/_/g, " "),
                data: rows.map((r) => r[col]),
                backgroundColor:
                    idx === 0 ? "rgba(99, 102, 241, 0.5)" : "rgba(139, 92, 246, 0.5)",
                borderColor: idx === 0 ? "#6366f1" : "#8b5cf6",
                borderWidth: 2,
                borderRadius: 8,
            }));
 
            chartInstance.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: rows.map((r) => r[labelCol]),
                    datasets: datasets,
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: "#94a3b8", font: { family: "Outfit" } },
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: "rgba(255,255,255,0.05)" },
                            ticks: { color: "#94a3b8" },
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: "#94a3b8" },
                        },
                    },
                },
            });
        };
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_0%_0%,rgba(13,148,136,0.1)_0px,transparent_50%)]" />
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(at_100%_0%,rgba(20,184,166,0.05)_0px,transparent_50%)]" />
            </div>
 
            <header className="relative pt-12 pb-8 text-center">
                <p className="text-teal-600 font-semibold mb-2 uppercase tracking-[2px] text-sm">
                    Vanna Agent
                </p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    InternHub Data Assistant
                </h1>
            </header>
 
            <main className="relative max-w-275 w-[95%] mx-auto pb-16 flex flex-col gap-8">
                {/* Search Bar */}
                <section className="sticky top-5 z-100 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-sm flex gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && performQuery()}
                        placeholder="Ask anything about interns, departments, or organizations..."
                        className="flex-1 bg-slate-50 border border-slate-300 p-4 rounded-2xl text-slate-900 text-lg focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all shadow-sm"
                    />
                    <button
                        onClick={performQuery}
                        disabled={loading}
                        className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-8 rounded-2xl font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-2">
                        {!loading ? (
                            "Execute"
                        ) : (
                            <div className="w-6 h-6 border-2 border-slate-200 border-t-white rounded-full animate-spin" />
                        )}
                    </button>
                </section>
 
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                        Error: {error}
                    </div>
                )}
 
                {/* SQL Panel */}
                {/* {showResults && (
                    <div className="bg-black rounded-2xl p-6 border-l-4 border-violet-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between font-mono text-xs uppercase mb-3 text-violet-400">
                            <span>Generated PostgreSQL Query</span>
                            <span className="text-slate-500">Optimized by Llama 3.3</span>
                        </div>
                        <code className="font-mono text-slate-300 break-all leading-relaxed">
                            {sql}
                        </code>
                    </div>
                )} */}
 
                {/* Chart Section */}
                {/* <div
                    className={`${showResults && results.length >= 2 ? "block" : "hidden"} bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-xl animate-in fade-in zoom-in-95 duration-500`}>
                    <div className="font-mono text-xs uppercase mb-6 text-slate-400">
                        Data Visualization
                    </div>
                    <div className="h-100">
                        <canvas ref={chartRef} width="400" height="200"></canvas>
                    </div>
                </div> */}
 
                {/* Results Table */}
                {showResults && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-4 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="overflow-x-auto rounded-2xl">
                            <table className="w-full border-collapse text-sm text-left">
                                <thead>
                                    <tr className="bg-slate-50">
                                        {columns.map((col) => (
                                            <th
                                                key={col}
                                                className="p-5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                                {col.replace(/_/g, " ")}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.length > 0 ? (
                                        results.map((row, idx) => (
                                            <tr
                                                key={idx}
                                                className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                                                {columns.map((col) => (
                                                    <td key={col} className="p-5 text-slate-700">
                                                        {row[col] === null ? "-" : String(row[col])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={columns.length || 1}
                                                className="p-10 text-center text-slate-500">
                                                No records found in database.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
 
                {/* Empty State */}
                {!showResults && !loading && (
                    <div className="py-40 text-center text-slate-500 flex flex-col items-center">
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="mb-4 opacity-30">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <p className="text-lg">
                            Intelligence is waiting. Ask your first question above.
                        </p>
                        <p className="text-sm mt-2 opacity-60">
                            Try: &quot;List all interns from MIT university&quot;
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};
 
export default AskAi;
 
 