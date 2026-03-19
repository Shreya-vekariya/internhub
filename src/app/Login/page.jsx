"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { useDispatch, useSelector } from "react-redux";
import { signIn } from "next-auth/react";
import { loadUser } from "../../redux/authActions";
export default function Login() {
	const [message, setMessage] = useState({ text: "", isError: false });
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
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
					<p className="text-gray-500 mt-2">Please enter your details</p>
				</div>

				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={handleSubmit}>
					{({ isSubmitting }) => (
						<Form className="space-y-6">
							{/* Email Field */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email Address
								</label>
								<Field
									name="email"
									type="email"
									placeholder="name@company.com"
									className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-black"
								/>
								<ErrorMessage
									name="email"
									component="div"
									className="text-red-500 text-xs mt-1 font-medium"
								/>
							</div>

							{/* Password Field */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Password
								</label>
								<Field
									name="password"
									type="password"
									placeholder="••••••••"
									className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-black"
								/>
								<ErrorMessage
									name="password"
									component="div"
									className="text-red-500 text-xs mt-1 font-medium"
								/>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all active:scale-[0.98] disabled:bg-blue-300 disabled:cursor-not-allowed">
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
								? "bg-red-50 text-red-600 border border-red-100"
								: "bg-green-50 text-green-600 border border-green-100"
						}`}>
						{message.text}
					</div>
				)}

				<p className="mt-8 text-center text-sm text-gray-600">
					Do not have an account?{" "}
					<a
						href="/Register"
						className="text-blue-600 font-semibold hover:underline">
						Sign up free
					</a>
				</p>
			</div>
		</div>
	);
}
