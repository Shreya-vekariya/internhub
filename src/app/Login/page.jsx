"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { loadUser } from "../../redux/authActions";
import Link from "next/link";

export default function Login() {
	const [message, setMessage] = useState({ text: "", isError: false });
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const dispatch = useDispatch();

	const initialValues = {
		email: "",
		password: "",
	};

	const validationSchema = Yup.object({
		email: Yup.string()
			.email("Invalid email address")
			.required("Email is required"),
		password: Yup.string()
			.min(6, "Minimum 6 characters")
			.required("Password is required"),
	});



	const handleSubmit = async (values, { setSubmitting }) => {
		setSubmitting(true);
		try {
			const result = await signIn("credentials", {
				redirect: false,
				email: values.email,
				password: values.password,
			});

			if (result.error) {
				setMessage({ text: result.error, isError: true });
			} else {
				// 1. Load the user into Redux
				const action = await dispatch(loadUser());
				const loggedInUser = action?.payload; // Assuming your action returns the user data
				console.log(loggedInUser)

				setMessage({ text: "Login successful!", isError: false });

				// 2. Role-Based Redirect
				if (loggedInUser?.role === "Admin") {
					router.push("/Admin");
				} else if (loggedInUser?.role === "Intern") {
					router.push("/Intern");
				}
				else if (loggedInUser?.role === "Head") {
					router.push("/Head");
				} else {
					router.push("/");
				}
			}
		} catch (err) {
			console.error("Login failed:", err);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-4">
			<div className="max-w-md w-full bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-slate-700">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold text-white">Welcome Back</h2>
					<p className="text-slate-400 mt-2">Please enter your details</p>
				</div>

				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={handleSubmit}>
					{({ isSubmitting }) => (
						<Form className="space-y-6">
							{/* Email Field */}
							<div>
								<label className="block text-sm font-medium text-slate-300 mb-1">
									Email Address
								</label>
								<Field
									name="email"
									type="email"
									placeholder="name@company.com"
									className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-slate-700 outline-none transition-all text-white placeholder-slate-500"
								/>
								<ErrorMessage
									name="email"
									component="div"
									className="text-red-400 text-xs mt-1 font-medium"
								/>
							</div>

							{/* Password Field */}
							<div>
								<label className="block text-sm font-medium text-slate-300 mb-1">
									Password
								</label>
						<div className="relative">
							<Field
								name="password"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								className="w-full pr-12 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-slate-700 outline-none transition-all text-white placeholder-slate-500"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((prev) => !prev)}
								className="absolute inset-y-0 right-0 inline-flex items-center justify-center w-12 text-slate-400 hover:text-slate-200"
							>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg shadow-md transition-all active:scale-[0.98] disabled:bg-indigo-300 disabled:cursor-not-allowed">
								{isSubmitting ? "Signing in..." : "Login"}
							</button>
						</Form>
					)}
				</Formik>

				{/* Status Message */}
				{message.text && (
					<div
						className={`mt-6 p-3 rounded-lg text-center text-sm font-medium ${
							message.isError
								? "bg-red-900/20 text-red-400 border border-red-800/30"
								: "bg-emerald-900/20 text-emerald-400 border border-emerald-800/30"
						}`}>
						{message.text}
					</div>
				)}

				<p className="mt-8 text-center text-sm text-slate-400">
					Cannot remember password?{" "}
					<Link
						href="/ForgotPassword"
						className="text-indigo-400 font-semibold hover:underline">
						Forgot Password
					</Link>
				</p>
			</div>
		</div>
	);
}
