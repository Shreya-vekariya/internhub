import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const HASURA_URL = process.env.HASURA_PROJECT_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

export async function POST(req) {
    try {
        const body = await req.json();
        // 1. Destructure all fields including new Intern-specific ones
        const { 
            name, 
            email, 
            password, 
            role, 
            college, 
            gender, 
            dept_id, 
            start_date, 
            end_date, 
            status 
        } = body;

        // Basic validation
        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: "Required fields (Name, Email, Password, Role) are missing" },
                { status: 400 },
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const isHead = role === "Head";

        // 2. Define the User Insertion Mutation with all possible fields
        const userMutation = `
            mutation InsertUser(
                $name: String!, 
                $email: String!, 
                $password: String!, 
                $role: String!, 
                $college: String, 
                $gender: String, 
                $dept_id: Int,
                $start_date: date,
                $end_date: date,
                $status: String
            ) {
                insert_users_one(object: {
                    name: $name, 
                    email: $email, 
                    password: $password, 
                    role: $role, 
                    college: $college, 
                    gender: $gender, 
                    department_id: $dept_id,
                    start_date: $start_date,
                    end_date: $end_date,
                    status: $status
                }) { 
                    id 
                    email
                }
            }
        `;

        // Step 1: Create the User in Hasura
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
                    role: role,
                    college: college || null,
                    gender: gender || null,
                    dept_id: dept_id ? parseInt(dept_id) : null,
                    // New date and status fields
                    start_date: start_date || null,
                    end_date: end_date || null,
                    status: status || "pending",
                },
            }),
        });

        const responseData = await res.json();

        if (responseData.errors) {
            console.error("Hasura Error:", responseData.errors);
            throw new Error(responseData.errors[0].message);
        }

        const newUser = responseData.data.insert_users_one;
        if (!newUser) throw new Error("User creation failed: No data returned from Hasura.");

        const newUserId = newUser.id;

        // Step 2: If the user is a Head, update the Department's head_id
        if (isHead && dept_id) {
            const updateDeptMutation = `
                mutation UpdateDeptHead($dept_id: Int!, $head_id: Int!) {
                    update_departments_by_pk(
                        pk_columns: { id: $dept_id },
                        _set: { head_id: $head_id }
                    ) { 
                        id 
                        name
                    }
                }
            `;

            const deptRes = await fetch(HASURA_URL, {
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

            const deptData = await deptRes.json();
            if (deptData.errors) {
                console.error("Department Update Error:", deptData.errors);
                // We don't necessarily want to fail the whole request if the user was created
                // but the dept assignment failed, but it's good to log it.
            }
        }

        return NextResponse.json({
            message: isHead 
                ? "Head user created and assigned to department successfully" 
                : "User created successfully",
            userId: newUserId
        }, { status: 201 });

    } catch (error) {
        console.error("Registration API Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 },
        );
    }
}