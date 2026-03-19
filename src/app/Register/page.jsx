"use client";


import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

export default function Register() {

    const router = useRouter();

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
			// .matches(/[0-9]/, "Must contain one number")
			.required("Password is required"),
	});

	// 2. Initialize Formik/
	const formik = useFormik({
		initialValues: {
			name: "",
			email: "",
			password: "",
			role: "",
		},
		validationSchema: validationSchema,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				const res = await fetch("/api/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(values),
				});
				const data = await res.json();
				console.log("Server Response:", data);

				if (res.ok) {
					router.push("/Login");
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
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-extrabold text-gray-900">
						Create Account
					</h2>
					<p className="text-gray-500 mt-2">Join us today</p>
				</div>

				<form onSubmit={formik.handleSubmit} className="space-y-4">
					{/* Name Field */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Full Name
						</label>
						<input
							name="name"
							type="text"
							{...formik.getFieldProps("name")}
							className={`w-full px-4 py-2 border rounded-lg outline-none transition-all text-black ${
								formik.touched.name && formik.errors.name
									? "border-red-500 ring-1 ring-red-500"
									: "border-gray-300 focus:ring-2 focus:ring-blue-500"
							}`}
						/>
						{formik.touched.name && formik.errors.name && (
							<p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
						)}
					</div>

					{/* Email Field */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email Address
						</label>
						<input
							name="email"
							type="email"
							{...formik.getFieldProps("email")}
							className={`w-full px-4 py-2 border rounded-lg outline-none transition-all text-black ${
								formik.touched.email && formik.errors.email
									? "border-red-500 ring-1 ring-red-500"
									: "border-gray-300 focus:ring-2 focus:ring-blue-500"
							}`}
						/>
						{formik.touched.email && formik.errors.email && (
							<p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
						)}
					</div>

					{/* Password Field */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<input
							name="password"
							type="password"
							{...formik.getFieldProps("password")}
							className={`w-full px-4 py-2 border rounded-lg outline-none transition-all text-black ${
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

					<button
						type="submit"
						disabled={formik.isSubmitting}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-blue-300">
						{formik.isSubmitting ? "Registering..." : "Register Now"}
					</button>
				</form>
				<p className="mt-8 text-center text-sm text-gray-600">
					Already have an account?{" "}
					<a
						href="/Login"
						className="text-blue-600 font-semibold hover:underline">
						Login
					</a>
				</p>
			</div>
		</div>
	);
}
