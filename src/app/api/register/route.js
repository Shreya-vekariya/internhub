import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const HASURA_URL = process.env.HASURA_PROJECT_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

export async function POST(req) {
	try {
		const body = await req.json();
		const { name, email, password, role, college, gender, dept_id } = body;

		if (!name || !email || !password) {
			return NextResponse.json(
				{ error: "All fields required" },
				{ status: 400 },
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const isHead = role === "Head";

		const mutation = `
            mutation RegisterUser(
                $name: String!, 
                $email: String!, 
                $password: String!, 
                $role: String!, 
                $college: String, 
                $gender: String, 
                $dept_id: Int
            ) {
                # 1. Create the User
                insert_users_one(object: {
                    name: $name, 
                    email: $email, 
                    password: $password, 
                    role: $role, 
                    college: $college,
                    gender: $gender,
                    department_id: $dept_id
                }) {
                    id
                    email
                }

                ${isHead? `
                update_departments_by_pk(
                    pk_columns: { id: $dept_id },
                    _set: { head_id: 0 } # TEMPORARY: See explanation below
                ) {
                    id
                    name
                }
                `: ""}
            }
        `;

		// Step 1: Create the User
		const userMutation = `
            mutation InsertUser($name: String!, $email: String!, $password: String!, $role: String!, $college: String, $gender: String, $dept_id: Int) {
                insert_users_one(object: {
                    name: $name, email: $email, password: $password, role: $role, college: $college, gender: $gender, department_id: $dept_id
                }) { id }
            }
        `;

		const res = await fetch(HASURA_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-hasura-admin-secret": HASURA_ADMIN_SECRET,
			},
			body: JSON.stringify({
				query: userMutation,
				variables: {
					name,
					email: email.toLowerCase(),
					password: hashedPassword,
					role: role || "Intern",
					college: college || null,
					gender: gender || null,
					dept_id: dept_id ? parseInt(dept_id) : null,
				},
			}),
		});

		const responseData = await res.json();
		if (responseData.errors) throw new Error(responseData.errors[0].message);

		const newUserId = responseData.data.insert_users_one.id;

		// Step 2: If the user is a Head, update the Department
		if (isHead && dept_id) {
			const updateDeptMutation = `
                mutation UpdateDeptHead($dept_id: Int!, $head_id: Int!) {
                    update_departments_by_pk(
                        pk_columns: { id: $dept_id },
                        _set: { head_id: $head_id }
                    ) { id }
                }
            `;

			await fetch(HASURA_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-hasura-admin-secret": HASURA_ADMIN_SECRET,
				},
				body: JSON.stringify({
					query: updateDeptMutation,
					variables: {
						dept_id: parseInt(dept_id),
						head_id: newUserId,
					},
				}),
			});
		}

		return NextResponse.json({
			message: "User created and assigned as Head successfully",
		});
	} catch (error) {
		console.error("Server Error:", error);
		return NextResponse.json(
			{ error: error.message || "Internal Server Error" },
			{ status: 500 },
		);
	}
}