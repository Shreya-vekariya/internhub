"use client";

import { useEffect, useState } from "react";
import { userlist, updateUser, deleteUser, getDepartments } from "../../lib/useAdmin"; // Added getDepartments
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]); // State for departments
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [deptFilter, setDeptFilter] = useState("All");
    
    const router = useRouter();
    const currentUser = useSelector((state) => state.auth.user);

    const fetchData = async () => {
        const userData = await userlist();
        const deptData = await getDepartments(); // Fetch depts for the filter dropdown
        setUsers(userData);
        setDepartments(deptData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRoleChange = async (id, newRole) => {
        try {
            await updateUser(id, { role: newRole });
            await fetchUsers(); 
        } catch (error) {
            alert("Failed to update role");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(id);
                setUsers(users.filter((u) => u.id !== id));
            } catch (error) {
                alert("Failed to delete user");
            }
        }
    };

    // Inside your Admin component
    const filteredUsers = users.filter((user) => {
        // 1. Hide self
        if (String(user.id) === String(currentUser?.id)) return false;

        // 2. Search by Name, College, OR Department Name
        const s = searchTerm.toLowerCase();
        const matchesSearch = 
            (user.name || "").toLowerCase().includes(s) || 
            (user.college || "").toLowerCase().includes(s) ||
            (user.department_name || "").toLowerCase().includes(s);

        // 3. Filter by Role Dropdown
        const matchesRole = roleFilter === "All" || user.role === roleFilter;

        // 4. Filter by Department Dropdown
        const matchesDept = deptFilter === "All" || String(user.deptartment_id) === String(deptFilter);

        return matchesSearch && matchesRole && matchesDept;
    });

    return (
        <div className="min-h-screen p-6 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <button onClick={() => router.push("/AddDepartment")} className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold">+ Add Department</button>
                    <button onClick={() => router.push("/AddUser")} className="bg-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold">+ Add User</button>
                </div>
            </div>

            {/* SEARCH AND FILTER BAR */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-900 p-4 rounded-xl border border-gray-800">
                <input 
                    type="text"
                    placeholder="Search by name or college..."
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <select 
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 outline-none"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="All">All Roles</option>
                    <option value="Head">Head</option>
                    <option value="Intern">Intern</option>
                </select>

                <select 
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 outline-none"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                >
                    <option value="All">All Departments</option>
                    {departments.map(dept => (
                        <option key={dept.id} value={String(dept.id)}>{dept.name}</option>
                    ))}
                </select>
            </div>

            <div className="shadow rounded-xl p-4 mb-6 border border-gray-700">
                <h2 className="text-lg font-semibold mb-4">All Users ({filteredUsers.length})</h2>

                {filteredUsers.length === 0 ? (
                    <p className="text-gray-500">No matching users found</p>
                ) : (
                    <div className="space-y-3">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="flex justify-between items-center border border-gray-700 p-3 rounded-lg bg-gray-900">
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email} • <span className="text-gray-400">{user.college || ""}</span></p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">Current: {user.role}</span>
                                        <select
                                            className="text-xs bg-gray-800 text-white border border-gray-600 rounded px-1 outline-none"
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            <option value="Intern">Intern</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Head">Head</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => router.push(`/${user.id}/view`)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">View</button>
                                    <button onClick={() => router.push(`/${user.id}/edit`)} className="bg-green-600 text-white px-4 py-2 rounded text-sm">Edit</button>
                                    <button onClick={() => handleDelete(user.id)} className="bg-red-600 text-white px-4 py-2 rounded text-sm">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}