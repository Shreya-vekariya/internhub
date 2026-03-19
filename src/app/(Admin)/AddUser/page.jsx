"use client";

import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // Added useEffect, useState
import { getDepartments } from "../../lib/useAdmin"; // Added import
import * as Yup from "yup";

export default function Register() {

    const router = useRouter();
    const [depts, setDepts] = useState([]); // Added state

    // Added fetch effect
    useEffect(() => {
        const load = async () => {
            const data = await getDepartments();
            setDepts(data);
        };
        load();
    }, []);

	

    // 1. Define the Validation Schema
    const validationSchema = Yup.object({
            name: Yup.string()
                .min(2, "Name is too short")
                .max(50, "Name is too long")
                .required("Full name is required"),
            email: Yup.string()
                .email("Invalid email address")
                .required("Email is required"),
            password: Yup.string()
                .min(8, "Password must be at least 8 characters")
                .matches(/[A-Z]/, "Must contain one uppercase letter")
                .required("Password is required"),

            gender :Yup.string().required("Required"),
            role :Yup.string().required("Required"),
            dept_id: Yup.string().required("Required"), // Added validation
        });

    // 2. Initialize Formik
    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            role: "",
            college:"",
            gender:"",
            dept_id: "", // Added initial value
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                });
				console.log(values)
                const data = await res.json();

                if (res.ok) {
                    router.push("/Admin");
                    resetForm();
                } else {
                    console.error("Registration failed:", data.error);
                    alert(data.error?.message || data.error || "Registration failed");
                }
            } catch (err) {
                console.error("Network or parsing error:", err);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
            <div className="min-h-screen flex items-center justify-center  p-4">
                <div className="max-w-md w-full  rounded-xl shadow-lg p-8 border ">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-white">Create User</h2>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">
                                Full Name
                            </label>
                            <input
                                name="name"
                                type="text"
                                {...formik.getFieldProps("name")}
                                className={`w-full px-4 py-2 border rounded-lg bg-white  outline-none transition-all text-black ${
                                    formik.touched.name && formik.errors.name
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                                }`}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="text-red-500 text-xs mt-1">
                                    {formik.errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">
                                Email Address
                            </label>
                            <input
                                name="email"
                                type="email"
                                {...formik.getFieldProps("email")}
                                className={`w-full px-4 py-2 border rounded-lg bg-white  outline-none transition-all text-black ${
                                    formik.touched.email && formik.errors.email
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                                }`}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                    {formik.errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                {...formik.getFieldProps("password")}
                                className={`w-full px-4 py-2 border rounded-lg outline-none bg-white transition-all text-black ${
                                    formik.touched.password && formik.errors.password
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                                }`}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="text-red-500 text-xs mt-1">
                                    {formik.errors.password}
                                </p>
                            )}
                        </div>

                        {/* Added Department Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">
                                Department
                            </label>
                            <select
                                name="dept_id"
                                {...formik.getFieldProps("dept_id")}
                                className={`w-full px-4 py-2 border rounded-lg bg-white text-black outline-none transition-all ${
                                    formik.touched.dept_id && formik.errors.dept_id
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                                }`}
                            >
                                <option value="">Select Department</option>
                                {depts.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                            {formik.touched.dept_id && formik.errors.dept_id && (
                                <p className="text-red-500 text-xs mt-1">{formik.errors.dept_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-1">
                                college
                            </label>
                            <input
                                name="college"
                                type="text"
                                {...formik.getFieldProps("college")}
                                className={`w-full px-4 py-2 border rounded-lg outline-none bg-white transition-all text-black ${
                                    formik.touched.college && formik.errors.college
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                                }`}
                            />
                            {formik.touched.college && formik.errors.college && (
                                <p className="text-red-500 text-xs mt-1">
                                    {formik.errors.college}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Role
                            </label>

                            <div className="flex gap-4">
                                {["Intern", "Admin", "Head"].map((g) => (
                                    <label key={g} className="flex items-center gap-2 text-white">
                                        <input
                                            type="radio"
                                            name="role"
                                            value={g}
                                            checked={formik.values.role === g}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className="accent-blue-500"
                                        />
                                        {g.charAt(0) + g.slice(1).toLowerCase()}
                                    </label>
                                ))}
                            </div>

                            {formik.touched.role && formik.errors.role && (
                                <p className="text-red-500 text-xs mt-1">
                                    {formik.errors.role}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Gender
                            </label>

                            <div className="flex gap-4">
                                {["MALE", "FEMALE", "OTHER"].map((g) => (
                                    <label key={g} className="flex items-center gap-2 text-white">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={g}
                                            checked={formik.values.gender === g}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className="accent-blue-500"
                                        />
                                        {g.charAt(0) + g.slice(1).toLowerCase()}
                                    </label>
                                ))}
                            </div>

                            {formik.touched.gender && formik.errors.gender && (
                                <p className="text-red-500 text-xs mt-1">
                                    {formik.errors.gender}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white  font-bold py-3 rounded-lg transition-colors disabled:bg-blue-300">
                            {formik.isSubmitting ? "Creating..." : "Create user"}
                        </button>
                    </form>
                </div>
            </div>
        );
}