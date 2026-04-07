"use client";

import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDepartments, getUpdateDepartments } from "../../lib/useAdmin";
import * as Yup from "yup";
import { sendMail } from "../../lib/mail";

export default function Register() {
    const router = useRouter();
    const [depts, setDepts] = useState([]);
    const [availableDepts, setAvailableDepts] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getDepartments();
                const updateDepts = await getUpdateDepartments();
                setDepts(data || []);
                setAvailableDepts(updateDepts || []);
            } catch (error) {
                console.error("Error loading departments:", error);
            }
        };
        load();
    }, []);

    // 1. Validation Schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .min(2, "Name is too short")
            .max(50, "Name is too long")
            .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed")
            .required("Full name is required"),
        email: Yup.string()
            .email("Invalid email address")
            .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format")
            .required("Email is required"),
        password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .matches(/[A-Z]/, "Must contain at least one uppercase letter")
            .matches(/[0-9]/, "Must contain at least one number")
            .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Must contain at least one special character")
            .required("Password is required"),
        gender: Yup.string().required("Gender is required"),
        role: Yup.string().required("Role is required"),
        
        // Department: Required for Intern and Head
        dept_id: Yup.string().when("role", {
            is: (role) => role === "Intern" || role === "Head",
            then: (schema) => schema.required("Department is required"),
            otherwise: (schema) => schema.notRequired(),
        }),

        // Intern Specific Fields
        college: Yup.string().when("role", {
            is: "Intern",
            then: (schema) => schema.required("College name is required"),
        }),
        start_date: Yup.date().when("role", {
            is: "Intern",
            then: (schema) => schema.required("Start date is required"),
        }),
        end_date: Yup.date().when("role", {
            is: "Intern",
            then: (schema) => schema.required("End date is required")
                .min(Yup.ref('start_date'), "End date must be after start date")
                .test("is-3-months", "Internship must be at least 3 months long", function(value) {
                    const { start_date } = this.parent;
                    if (!start_date || !value) return true;
                    const minEnd = new Date(start_date);
                    minEnd.setMonth(minEnd.getMonth() + 3);
                    return new Date(value) >= minEnd;
                }),
        }),
        status: Yup.string().default("pending"),
    });

    // 2. Formik Initialization
    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            role: "",
            college: "",
            gender: "",
            dept_id: "",
            start_date: "",
            end_date: "",
            status: "pending",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                });
                const data = await res.json();

                if (res.ok) {
					const emailText = `Hello ${values.name},
 
Your account has been created successfully! 🎉
 
Here are your login credentials:
 
Username: ${values.email}
Password: ${values.password}
 
Please log in at: https://your-app-url.com/login
 
⚠️ Important: Keep your password safe and do not share it with anyone.
 
Thanks,
The Your App Team
      `;
 
                    const emailHTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #2c3e50;">Welcome ${values.name}! 🎉</h2>
  <p>Your account has been created successfully. Here are your login credentials:</p>
  <table style="border-collapse: collapse; margin: 10px 0;">
    <tr>
      <td style="padding: 4px 8px; font-weight: bold;">Username:</td>
      <td style="padding: 4px 8px;">${values.email}</td>
    </tr>
    <tr>
      <td style="padding: 4px 8px; font-weight: bold;">Password:</td>
      <td style="padding: 4px 8px;">${values.password}</td>
    </tr>
  </table>
  <p style="color: #e74c3c; font-size: 0.9em;">⚠️ Keep your password safe and do not share it with anyone.</p>
  <p>Thanks,<br>The Your App Team</p>
</div>
      `;
                    try {
                        const res = await sendMail({
                            sendTo: values.email,
                            subject: "Credentials for your new account",
                            text: emailText,
                            html: emailHTML,
                        });
                        if (res?.success) {
                            console.log("✅ Email sent successfully:", res.messageId);
                            alert("Email sent!");
                        } else {
                            console.log("❌ Email failed:", res?.error);
                            console.log("❌ Email failed:  1", res);
                            alert("Failed to send email", res);
                        }
                    } catch (err) {
                        console.error("❌ Error sending email:", err);
                        alert("Something went wrong");
                    }
                    router.push("/Admin");
                    resetForm();
                } else {
                    alert(data.error?.message || data.error || "Registration failed");
                }
            } catch (err) {
                console.error("Network error:", err);
                alert("Check your connection to Hasura/API.");
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Reset fields on role change
    useEffect(() => {
        if (formik.values.role === "Admin") {
            formik.setFieldValue("dept_id", "");
            formik.setFieldValue("college", "");
            formik.setFieldValue("start_date", "");
            formik.setFieldValue("end_date", "");
        } else if (formik.values.role === "Head") {
            formik.setFieldValue("college", "");
            formik.setFieldValue("start_date", "");
            formik.setFieldValue("end_date", "");
        }
    }, [formik.values.role]);

    const inputClasses = (name) => `w-full px-4 py-2 border rounded-lg bg-white text-black outline-none transition-all ${
        formik.touched[name] && formik.errors[name]
            ? "border-red-500 ring-1 ring-red-500"
            : "border-gray-300 focus:ring-2 focus:ring-blue-500"
    }`;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
            <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-white">Register New User</h2>
                    <p className="text-gray-400 mt-2 text-sm">Fields marked with <span className="text-red-500">*</span> are required</p>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-5">
                    {/* Basic Info Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Full Name <span className="text-red-500">*</span></label>
                            <input type="text" {...formik.getFieldProps("name")} className={inputClasses("name")} placeholder="John Doe" />
                            {formik.touched.name && formik.errors.name && <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Email <span className="text-red-500">*</span></label>
                            <input type="email" {...formik.getFieldProps("email")} className={inputClasses("email")} placeholder="john@example.com" />
                            {formik.touched.email && formik.errors.email && <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-1">Password <span className="text-red-500">*</span></label>
                        <input type="password" {...formik.getFieldProps("password")} className={inputClasses("password")} />
                        {formik.touched.password && formik.errors.password && <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>}
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Role <span className="text-red-500">*</span></label>
                        <div className="flex gap-6 bg-gray-700 p-3 rounded-lg">
                            {["Intern", "Head"].map((r) => (
                                <label key={r} className="flex items-center gap-2 text-white cursor-pointer hover:text-blue-400">
                                    <input type="radio" name="role" value={r} checked={formik.values.role === r} onChange={formik.handleChange} className="accent-blue-500 w-4 h-4" />
                                    {r}
                                </label>
                            ))}
                        </div>
                        {formik.touched.role && formik.errors.role && <p className="text-red-500 text-xs mt-1">{formik.errors.role}</p>}
                    </div>

                    {/* Conditional: Department (Visible for Intern & Head) */}
                    {(formik.values.role === "Intern" || formik.values.role === "Head") && (
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Department <span className="text-red-500">*</span></label>
                            <select {...formik.getFieldProps("dept_id")} className={inputClasses("dept_id")}>
                                <option value="">Select Department</option>
                                {(formik.values.role === "Head" ? availableDepts : depts).map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                            {formik.touched.dept_id && formik.errors.dept_id && <p className="text-red-500 text-xs mt-1">{formik.errors.dept_id}</p>}
                        </div>
                    )}

                    {/* Conditional: Intern Only Fields */}
                    {formik.values.role === "Intern" && (
                        <div className="space-y-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">College <span className="text-red-500">*</span></label>
                                <input type="text" {...formik.getFieldProps("college")} className={inputClasses("college")} />
                                {formik.touched.college && formik.errors.college && <p className="text-red-500 text-xs mt-1">{formik.errors.college}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Start Date <span className="text-red-500">*</span></label>
                                    <input type="date" {...formik.getFieldProps("start_date")} className={inputClasses("start_date")} />
                                    {formik.touched.start_date && formik.errors.start_date && <p className="text-red-500 text-xs mt-1">{formik.errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">End Date <span className="text-red-500">*</span></label>
                                    <input type="date" {...formik.getFieldProps("end_date")} className={inputClasses("end_date")} />
                                    {formik.touched.end_date && formik.errors.end_date && <p className="text-red-500 text-xs mt-1">{formik.errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Internship Status</label>
                                <select {...formik.getFieldProps("status")} className={inputClasses("status")}>
                                    <option value="pending">Pending</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

							<div>
								<label className="block text-sm font-medium text-white mb-2">Gender <span className="text-red-500">*</span></label>
								<div className="flex gap-6">
									{["MALE", "FEMALE", "OTHER"].map((g) => (
										<label key={g} className="flex items-center gap-2 text-white cursor-pointer">
											<input type="radio" name="gender" value={g} checked={formik.values.gender === g} onChange={formik.handleChange} className="accent-blue-500" />
											{g.charAt(0) + g.slice(1).toLowerCase()}
										</label>
									))}
								</div>
								{formik.touched.gender && formik.errors.gender && <p className="text-red-500 text-xs mt-1">{formik.errors.gender}</p>}
							</div>
                        </div>	
                    )}

                    {/* Gender Selection */}
                    
					<div className="flex  gap-4 ">
                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:bg-blue-800 disabled:opacity-50 mt-4 shadow-lg"
                    >
                        {formik.isSubmitting ? "Processing..." : "Create User"}
                    </button>

					<button
                        type="button"
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:bg-blue-800 disabled:opacity-50 mt-4 shadow-lg"
						onClick={() => router.push("/Admin")}
					>
                        Cancel
                    </button>
					</div>
                </form>
            </div>
        </div>
    );
}